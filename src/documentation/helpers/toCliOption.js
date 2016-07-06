/**
 * Takes a configuration path array and converters it to a cli option.
 *
 * @param {string[]} configPaths - The configuration path, a array consisting of properties.
 *
 * @returns {string} - The cli option to set the given configuration option.
 */
export default function toCliOption(configPaths) {
    return '--' + configPaths.join('-');
}
