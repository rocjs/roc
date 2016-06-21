/**
 * Takes a configuration path array and convertes it to a cli option.
 *
 * @param {string[]} configPaths - The configuration path, a array consiting of properties.
 *
 * @returns {string} - The cli option to set the given configuration option.
 */
export default function toCliOption(configPaths) {
    // Runtime should be added directly
    const paths = configPaths[0] === 'runtime' ?
        configPaths.slice(1) :
        configPaths;

    return '--' + paths.join('-');
}
