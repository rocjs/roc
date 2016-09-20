import { isPlainObject } from 'lodash';

/**
 * Given an input the function will return an object.
 *
 * @param {object} input - The input to be converted.
 *
 * @returns {object} - The converted result.
 */
export default function toObject(input) {
    if (isPlainObject(input)) {
        return input;
    }
    try {
        return JSON.parse(input);
    } catch (error) {
        return undefined;
    }
}
