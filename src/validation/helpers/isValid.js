import { isFunction, isRegExp } from 'lodash';

/**
 * Helper to use a validator.
 *
 * @param {object} value - Something to validate.
 * @param {function|RegExp} validator - A validator.
 * @return {boolean} - If valid or not.
 */
export default function isValid(value, validator) {
    // If we have no validator we assume the value to be valid
    if (!validator) {
        return true;
    }

    if (isFunction(validator)) {
        return validator(value);
    } else if (isRegExp(validator)) {
        if (!validator.test(value.toString())) {
            return 'Did not match the regexp: ' + validator;
        }

        return true;
    }

    throw new Error('Structure of configuration does not align with validation.');
}
