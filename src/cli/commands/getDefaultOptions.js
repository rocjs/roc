import { bold } from 'chalk';

/**
 * Gets and array with the default options for the cli.
 * Will be formatted to work with {@link generateTable}
 *
 * @param {string} name - What property the option/flag name should be set.
 *
 * @returns {Object[]} - Array with the default options formatted for {@link generateTable}.
 */
export default function getDefaultOptions(name) {
    return [{
        [name]: '-c, --config',
        description: `Path to configuration file, will default to ${bold('roc.config.js')} in current ` +
            `working directory.`
    }, {
        [name]: '-d, --directory',
        description: 'Path to working directory, will default to the current working directory. Can be either ' +
            'absolute or relative.'
    }, {
        [name]: '-h, --help',
        description: 'Output usage information.'
    }, {
        [name]: '-V, --verbose',
        description: 'Enable verbose mode.'
    }, {
        [name]: '-v, --version',
        description: 'Output version number.'
    }];
}
