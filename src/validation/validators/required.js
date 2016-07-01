import createInfoObject from '../helpers/createInfoObject';
import notEmpty from './notEmpty';

export const REQUIRED_ERROR = 'A value was required but none was given!';

/**
 * Marks that the value is required, that is that it's not undefined or null.
 *
 * @param {function} validator - Validator to validate against.
 * @return {function} - A function that takes a value and that returns true or false if valid or not.
 */
export default function required(validator, canBeEmpty = false) {
    if (!canBeEmpty) {
        validator = notEmpty(validator);
    }

    return (input, info) => {
        if (info) {
            return createInfoObject({ validator, required: true });
        }

        if (input === undefined || input === null) {
            return REQUIRED_ERROR;
        }

        if (!validator) {
            return true;
        }

        return validator(input);
    };
}
