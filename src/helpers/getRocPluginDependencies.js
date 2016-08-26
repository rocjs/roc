/**
 * Gets the Roc plugin dependencies from a `package.json`.
 *
 * @param {Object} packageJSON - A package.json file to fetch Roc plugin dependencies from.
 *
 * @returns {string[]} - An array with Roc plugins that exists in the `package.json`.
 */
export default function getRocPluginDependencies(packageJSON) {
    return [
        ...Object.keys(packageJSON.dependencies || {}),
        ...Object.keys(packageJSON.devDependencies || {}),
    ]
    .filter((dependency) => /^(?:@.*\/)?roc-plugin(-.+)/.test(dependency));
}
