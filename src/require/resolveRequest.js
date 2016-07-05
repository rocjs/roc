import resolve from 'resolve';

import { initSetDependencies, initGetDependenciesFromPath } from './manageDependencies';

export default function resolveRequest(exports, directory, dependencyContext) {
    const log = require('debug')(`roc:require`);
    const contextCache = {};
    const resolveCache = {};
    const pattern = /^([^\/]*)\/?([^\/]*)/;
    const inProject = initInProject(directory);
    const getCurrentModule = initGetCurrentModule(
        initSetDependencies(dependencyContext),
        initGetDependenciesFromPath(dependencyContext)
    );

    const getContext = (path) => {
        if (!contextCache[path]) {
            contextCache[path] = inProject(path) ?
                exports :
                getCurrentModule(path);
        }

        return contextCache[path];
    };

    return (identifier = 'No identifier') => {
        const resolveRequestHelper = (request, context) => {
            if (request.charAt(0) === '¡') {
                return request.substring(1);
            }
            const rocContext = getContext(context);
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
                    rocContext[module].resolve(request, context, rocContext[module].context) :
                    resolve.sync(request, { basedir: rocContext[module].context });

                log(`(${identifier}) : Found an alias for [${module}] => [${newRequest}]`);

                return newRequest ?
                    newRequest :
                    request;
            }

            return request;
        };

        return (request, context) => {
            if (!resolveCache[`${context}@@@@@${request}`]) {
                resolveCache[`${context}@@@@@${request}`] = resolveRequestHelper(request, context);
            } else {
                // log(`(${identifier}) : Found [${request}] in the cache`);
            }

            return resolveCache[`${context}@@@@@${request}`];
        };
    };
}

function initInProject(directory) {
    const directoryPattern = new RegExp(`^${directory}(.*)$`);
    return (path) => {
        const matches = directoryPattern.exec(path);
        if (matches) {
            return matches[0].indexOf('/node_modules/') === -1;
        }
    };
}

function initGetCurrentModule(getDependencies, getDependenciesFromPath) {
    const pattern = /.*node_modules\/([^\/]*)\/?([^\/]*)/;
    return (path) => {
        const matches = pattern.exec(path);

        if (matches) {
            return getDependencies(
                matches[1].charAt(0) === '@' ?
                    matches[1] + '/' + matches[2] :
                    matches[1]
            , 'exports');
        }

        // If we are using "npm link" we will probably end up here
        // This means that we are only running this when doing local development
        return getDependenciesFromPath(path, 'exports');
    };
}
