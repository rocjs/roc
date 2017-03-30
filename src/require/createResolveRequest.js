import { sep } from 'path';

import resolve from 'resolve';

import { initGetDependencies, initGetDependenciesFromPath } from './manageDependencies';
import createPathRegExp from './createPathRegExp';

export default function createResolveRequest(exports, directory, dependencyContext) {
    const log = require('debug')('roc:core:require'); // eslint-disable-line

    const contextCache = {};
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

    const requestHelper = (request, context, fallback, identifier) => {
        // If we got an empty request we want to let Node handle it
        if (!request) {
            return { completedRequest: request };
        }

        // Provides a way to opt-out of the Roc require system
        if (request.charAt(0) === '#') {
            return { completedRequest: request.substring(1) };
        }

        let rocContext = getContext(context, fallback);
        if (!rocContext && !fallback) {
            return { completedRequest: request };
        } else if (!rocContext) {
            // If all other fails we will resolve in the projects context.
            rocContext = exports;
        }

        log(`(${identifier}) : ${fallback ? '<Fallback> ' : ''}Checking [${request}] for [${context}]`);

        const matches = pattern.exec(request);
        const module = matches[1].charAt(0) === '@' ?
            `${matches[1]}/${matches[2]}` :
            matches[1];

        if (!module || !rocContext[module]) {
            return { completedRequest: request };
        }

        return {
            module,
            rocContext: rocContext[module],
        };
    };

    function resolveRequest(identifier = 'No identifier') {
        const resolveCache = {};
        const defaultResolver = (request, context) => resolve.sync(request, { basedir: context });

        const resolveRequestHelper = (request, context, fallback = false, resolver = defaultResolver) => {
            const { completedRequest, module, rocContext } = requestHelper(request, context, fallback, identifier);

            if (completedRequest) {
                return completedRequest;
            }

            const newRequest = rocContext.resolve ?
                rocContext.resolve({
                    extensionContext: rocContext.context,
                    identifier,
                    module,
                    request,
                    requestContext: context,
                }) : resolver(request, rocContext.context);

            log(`(${identifier}) : Found an alias for [${module}] => [${newRequest}]`);

            return newRequest || request;
        };

        return (
            request,
            context,
            {
                fallback = false,
                resolver,
            } = {}
        ) => {
            if (!resolveCache[`${context}@@@@@${request}@@@@@${fallback}`]) {
                resolveCache[`${context}@@@@@${request}@@@@@${fallback}`] =
                    resolveRequestHelper(request, context, fallback, resolver);
            }

            return resolveCache[`${context}@@@@@${request}@@@@@${fallback}`];
        };
    }

    function resolveRequestAsync(identifier = 'No identifier') {
        const resolveCache = {};
        const defaultResolver = (request, context, callback) => resolve(request, { basedir: context }, callback);
        const completeResolve = (callback, request, module) => (error, newRequest) => {
            if (error) {
                return callback(error);
            }

            log(`(${identifier}) : Found an alias for [${module}] => [${newRequest}]`);
            return callback(null, newRequest || request);
        };

        const resolveRequestHelper = (request, context, fallback = false, resolver = defaultResolver, callback) => {
            const { completedRequest, module, rocContext } = requestHelper(request, context, fallback, identifier);

            if (completedRequest) {
                return callback(null, completedRequest);
            }

            if (rocContext.resolve) {
                try {
                    completeResolve(callback, request, module)(null, rocContext.resolve({
                        extensionContext: rocContext.context,
                        identifier,
                        module,
                        request,
                        requestContext: context,
                    }));
                } catch (error) {
                    completeResolve(callback, request, module)(error);
                }
            } else {
                resolver(request, rocContext.context, completeResolve(callback, request, module));
            }
        };

        return (
            request,
            context,
            {
                fallback = false,
                resolver,
            } = {},
            callback
        ) => {
            if (resolveCache[`${context}@@@@@${request}@@@@@${fallback}`]) {
                return callback(null, resolveCache[`${context}@@@@@${request}@@@@@${fallback}`]);
            }

            resolveRequestHelper(request, context, fallback, resolver, (error, newRequest) => {
                if (newRequest) {
                    resolveCache[`${context}@@@@@${request}@@@@@${fallback}`] = newRequest;
                }
                return callback(error, resolveCache[`${context}@@@@@${request}@@@@@${fallback}`]);
            });
        };
    }

    return (identifier, async = false) => {
        if (async) {
            return resolveRequestAsync(identifier);
        }

        return resolveRequest(identifier);
    };
}

function initInProject(directory) {
    const directoryPattern = createPathRegExp(`^${directory}(.*)$`);
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
    const normalPattern = createPathRegExp(`.*node_modules${sep}([^${sep}]*)${sep}?([^${sep}]*)`);
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
