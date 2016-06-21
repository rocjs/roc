import { isString } from 'lodash';

/**
 * Given an input the function will return an string.
 *
 * @param {object} input - The input to be converted.
 *
 * @returns {number} - The converted result.
 */
export default function toString(input) {
    if (isString(input)) {
        return input;
    }

    return input.toString();
}
