/* Using global variables here to make sure that we can access the values set from different projects.
 * This guarantees that the variables will live outside the require cache, something that we need for stability.
 */
global.roc = global.roc || {};
global.roc.dependencies = global.roc.dependencies || {};
global.roc.dependencies.devExports = global.roc.dependencies.devExports || {};
global.roc.dependencies.dependencyContext = global.roc.dependencies.dependencyContext || {};
global.roc.dependencies.pathMapping = global.roc.dependencies.pathMapping || {};

export function getDevExports(name) {
    return global.roc.dependencies.devExports[name + '-dev'];
}

export function setDevExports(name, exports) {
    global.roc.dependencies.devExports[name] = exports;
}

export function getDependencies(name, selector) {
    if (name) {
        return selector ?
            (global.roc.dependencies.dependencyContext[name] || {})[selector] :
            global.roc.dependencies.dependencyContext[name];
    }
}

export function getDependenciesFromPath(path, selector) {
    return getDependencies(
        Object.keys(global.roc.dependencies.pathMapping).find((extensionPath) => path.startsWith(extensionPath)),
        selector
    );
}

export function setDependencies(name, extensionDependencies, { dependencies } = {}, path) {
    global.roc.dependencies.dependencyContext[name] = {
        ...extensionDependencies,
        exports: removeFromExports(extensionDependencies.exports, dependencies)
    };

    if (path) {
        global.roc.dependencies.pathMapping[path] = name;
    }
}

// Removes dependencies that exists in the package.json for the extension in question
function removeFromExports(exports, dependencies = {}) {
    const localExports = { ...exports };
    Object.keys(localExports).forEach((exported) => {
        if (dependencies[exported]) {
            delete localExports[exported];
        }
    });
    return localExports;
}
