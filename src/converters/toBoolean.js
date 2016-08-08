import { isBoolean, isString } from 'lodash';

/**
 * Given an input the function will return a boolean.
 *
 * @param {object} input - The input to be converted.
 *
 * @returns {bool} - The converted result.
 */
export default function toBoolean(input) {
    if (isBoolean(input)) {
        return input;
    }

    if (isString(input) && (input.toLowerCase() === 'true' || input.toString().toLowerCase() === 'false')) {
        return input === 'true';
    }

    return false;
}
