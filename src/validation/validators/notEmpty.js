import { isArrayLike, isPlainObject } from 'lodash';

import createInfoObject from '../helpers/createInfoObject';
import isValid from '../helpers/isValid';

/**
 * Marks that the value can't be empty, undefined & null is allowed.
 *
 * Use together with {@link required} to also validate on undefined.
 *
 * @param {function} validator - Validator to validate against.
 * @return {function} - A function that takes a value and that returns true or false if valid or not.
 */
export default function notEmpty(validator) {
    function isEmpty(value) {
        if (isArrayLike(value)) {
            return !value.length;
        }

        if (isPlainObject(value)) {
            return !Object.keys(value).length;
        }

        // If it did not match one of the types above we will consider
        // it to not be empty
        return false;
    }

    return (input, info) => {
        if (info) {
            return createInfoObject({
                validator,
                canBeEmpty: false,
            });
        }

        if (input !== undefined && input !== null && isEmpty(input)) {
            return 'The value is required to not be empty!';
        }

        if (!validator) {
            return true;
        }

        return isValid(input, validator);
    };
}
