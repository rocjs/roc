import chalk from 'chalk';
import { isBoolean } from 'lodash';

import { warningLabel, feedbackMessage } from '../helpers/style';

/**
 * Given an input the function will return a boolean.
 *
 * @param {object} input - The input to be converted.
 * @param {boolean} defaultValue - Default value to use if conversion fails.
 * @param {string} name - The name of of what is converted.
 *
 * @returns {bool} - The converted result.
 */
export default function toBoolean(input, defaultValue, name) {
    if (isBoolean(input)) {
        return input;
    }
    if (input === 'true' || input === 'false') {
        return input === 'true';
    }

    console.log(feedbackMessage(
        warningLabel('Warning', 'Conversion Failed'),
        `Invalid value given for ${chalk.bold(name)}. Will use the default ${chalk.bold(defaultValue)}.`
    ));

    return defaultValue;
}
