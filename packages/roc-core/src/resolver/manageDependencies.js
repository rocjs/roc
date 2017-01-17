export function initGetDependencies({ extensionsDependencies }) {
    return (name, selector) => {
        if (name) {
            return selector ?
                (extensionsDependencies[name] || {})[selector] :
                extensionsDependencies[name];
        }

        return undefined;
    };
}

export function initGetDependenciesFromPath({ extensionsDependencies, pathsToExtensions }) {
    return (path, selector) =>
        initGetDependencies({ extensionsDependencies })(
            pathsToExtensions[Object.keys(pathsToExtensions).find((extensionPath) => path.startsWith(extensionPath))],
            selector,
        );
}

export function initSetDependencies({ extensionsDependencies, pathsToExtensions }) {
    return (name, extensionDependencies, { dependencies } = {}, path) => {
        const newExtensionsDependencies = {
            ...extensionsDependencies,
            [name]: {
                ...extensionDependencies,
                exports: removeFromExports(extensionDependencies.exports, dependencies),
            },
        };

        const newPathsToExtensions = path ?
            { ...pathsToExtensions, [path]: name } :
            pathsToExtensions;

        return {
            extensionsDependencies: newExtensionsDependencies,
            pathsToExtensions: newPathsToExtensions,
        };
    };
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
