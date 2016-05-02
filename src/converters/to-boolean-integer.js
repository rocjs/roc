import chalk from 'chalk';
import { toBoolean, toInteger } from '../converters';

import { warningLabel, feedbackMessage } from '../helpers/style';

/**
 * Given an input the function will return a boolean or integer.
 *
 * @param {object} input - The input to be converted.
 * @param {boolean} defaultValue - Default value to use if conversion fails.
 * @param {string} name - The name of of what is converted.
 *
 * @returns {bool|number} - The converted result.
 */
export default function toBooleanInteger(input, defaultValue, name) {
    if (parseInt(input, 10)) {
        return toInteger(input);
    } else if (toBoolean(input) || toBoolean(input) === false) {
        return toBoolean(input);
    }

    console.log(feedbackMessage(
        warningLabel('Warning', 'Conversion Failed'),
        `Invalid value given for ${chalk.bold(name)}. Will use the default ${chalk.bold(defaultValue)}.`
    ));

    return defaultValue;
}
