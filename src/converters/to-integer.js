import { isInteger } from 'lodash';

/**
 * Given an input the function will return an number.
 *
 * @param {object} input - The input to be converted.
 *
 * @returns {number} - The converted result.
 */
export default function toInteger(input) {
    if (isInteger(input)) {
        return input;
    }

    return parseInt(input, 10);
}
