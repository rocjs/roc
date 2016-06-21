/**
 * Gets the Roc package dependencies from a `package.json`.
 *
 * @param {Object} packageJson - A package.json file to fetch Roc package dependencies from.
 *
 * @returns {string[]} - An array with Roc packages that exists in the `package.json`.
 */
export default function getRocPackageDependencies(packageJson) {
    return [
        ...Object.keys(packageJson.devDependencies || {}),
        ...Object.keys(packageJson.dependencies || {})
    ]
    .filter((dependency) => /^(?:@.*\/)?roc-package(-.+)/.test(dependency));
}
