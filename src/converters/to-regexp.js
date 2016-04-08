import { isRegExp } from 'lodash';

/**
 * Given an input the function will return an RegExp.
 *
 * @param {object} input - The input to be converted.
 *
 * @returns {RegExp} - The converted result.
 */
export default function toRegExp(input) {
    if (isRegExp(input)) {
        return input;
    }

    // Remove potential leading / / and get possible flags
    const parsedInput = /^\/?(.*?)(?:\/?|\/([gimuy]*))$/.exec(input);

    return new RegExp(parsedInput[1], parsedInput[2]);
}
