import { sep } from 'path';

import resolve from 'resolve';

import { initGetDependencies, initGetDependenciesFromPath } from './manageDependencies';

export default function resolveRequest(exports, directory, dependencyContext) {
    const log = require('debug')('roc:core:require'); // eslint-disable-line

    const contextCache = {};
    const resolveCache = {};
    const pattern = /^([^\/]*)\/?([^\/]*)/;
    const inProject = initInProject(directory);
    const getCurrentModule = initGetCurrentModule(
        initGetDependencies(dependencyContext),
        initGetDependenciesFromPath(dependencyContext)
    );

    const getContext = (path, fallback) => {
        // Check if we already has the context in the cache and only create it if not
        if (!contextCache[`${path}@@@@@${fallback}`]) {
            contextCache[`${path}@@@@@${fallback}`] = inProject(path) ?
                exports :
                getCurrentModule(path, fallback);
        }

        return contextCache[`${path}@@@@@${fallback}`];
    };

    return (identifier = 'No identifier') => {
        const resolveRequestHelper = (request, context, fallback = false) => {
            // If we got an empty request we want to let Node handle it
            if (!request) {
                return request;
            }

            // Provides a way to opt-out of the Roc require system
            if (request.charAt(0) === '_') {
                return request.substring(1);
            }

            const rocContext = getContext(context, fallback);
            if (rocContext) {
                log(`(${identifier}) : Checking [${request}] for [${context}]`);

                const matches = pattern.exec(request);
                const module = matches[1].charAt(0) === '@' ?
                    `${matches[1]}/${matches[2]}` :
                    matches[1];

                if (!module || !rocContext[module]) {
                    return request;
                }

                const newRequest = rocContext[module].resolve ?
                    rocContext[module].resolve({
                        module,
                        request,
                        requestContext: context,
                        extensionContext: rocContext[module].context,
                    }) : resolve.sync(request, { basedir: rocContext[module].context });

                log(`(${identifier}) : Found an alias for [${module}] => [${newRequest}]`);

                return newRequest || request;
            }

            return request;
        };

        return (request, context, fallback = false) => {
            // Check if we already have the request in the cache and if so do nothing
            if (!resolveCache[`${context}@@@@@${request}@@@@@${fallback}`]) {
                resolveCache[`${context}@@@@@${request}@@@@@${fallback}`] =
                    resolveRequestHelper(request, context, fallback);
            }

            return resolveCache[`${context}@@@@@${request}@@@@@${fallback}`];
        };
    };
}

function initInProject(directory) {
    const directoryPattern = new RegExp(makePathReadyForRegExpInWindows(`^${directory}(.*)$`));
    return (path) => {
        const matches = directoryPattern.exec(path);
        if (matches) {
            return matches[0].indexOf(`${sep}node_modules${sep}`) === -1;
        }

        return false;
    };
}

function initGetCurrentModule(getDependencies, getDependenciesFromPath) {
    const fallbackPattern = /roc-.*/;
    const normalPattern = new RegExp(
        makePathReadyForRegExpInWindows(`.*node_modules${sep}([^${sep}]*)${sep}?([^${sep}]*)`)
    );
    return (path, fallback) => {
        // Will match against the last roc-* in the path
        if (fallback) {
            const match = path
                .split(sep)
                .reverse()
                .find((name) => fallbackPattern.test(name));

            if (match) {
                return getDependencies(match, 'exports');
            }
        } else {
            const matches = normalPattern.exec(path);

            if (matches) {
                return getDependencies(
                    matches[1].charAt(0) === '@' ?
                        `${matches[1]}/${matches[2]}` :
                        matches[1]
                , 'exports');
            }
        }

        // If we are using "npm link" we will probably end up here
        // This means that we are only running this when doing local development
        return getDependenciesFromPath(path, 'exports');
    };
}

function makePathReadyForRegExpInWindows(path) {
    if (sep === '\\') {
        return path.replace(/\\/g, '\\\\');
    }

    return path;
}
