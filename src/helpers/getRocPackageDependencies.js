/**
 * Gets the Roc package dependencies from a `package.json`.
 *
 * @param {Object} packageJSON - A package.json file to fetch Roc package dependencies from.
 *
 * @returns {string[]} - An array with Roc packages that exists in the `package.json`.
 */
export default function getRocPackageDependencies(packageJSON) {
    return [
        ...Object.keys(packageJSON.devDependencies || {}),
        ...Object.keys(packageJSON.dependencies || {}),
    ]
    .filter((dependency) => /^(?:@.*\/)?roc-package(-.+)/.test(dependency));
}
