import { toBoolean, toInteger } from '../converters';

/**
 * Given an input the function will return a boolean or integer.
 *
 * @param {object} input - The input to be converted.
 * @param {boolean} defaultValue - Default value to use if conversion fails.
 * @param {string} name - The name of of what is converted.
 *
 * @returns {bool|number} - The converted result.
 */
export default function toBooleanOrInteger(input, defaultValue, name) {
    if (parseInt(input, 10)) {
        return toInteger(input);
    }

    return toBoolean(input, defaultValue, name);
}
