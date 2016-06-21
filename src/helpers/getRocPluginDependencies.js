/**
 * Gets the Roc plugin dependencies from a `package.json`.
 *
 * @param {Object} packageJson - A package.json file to fetch Roc plugin dependencies from.
 *
 * @returns {string[]} - An array with Roc plugins that exists in the `package.json`.
 */
export default function getRocPluginDependencies(packageJson) {
    return [
        ...Object.keys(packageJson.devDependencies || {}),
        ...Object.keys(packageJson.dependencies || {})
    ]
    .filter((dependency) => /^(?:@.*\/)?roc-plugin(-.+)/.test(dependency));
}
