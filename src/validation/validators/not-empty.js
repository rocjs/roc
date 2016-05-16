import { isArrayLike, isPlainObject } from 'lodash';
import infoObject from '../info-object';

/**
 * Marks that the value can't be empty, undefined is allowed.
 *
 * Use together with {@link required} to also validate on undefined.
 *
 * @param {function} validator - Validator to validate against.
 * @return {function} - A function that takes a value and that returns true or false if valid or not.
 */
export default function notEmpty(validator) {
    return (input, info) => {
        if (info) {
            return infoObject({
                validator,
                notEmpty: true
            });
        }

        if (input !== undefined && isEmpty(input)) {
            return 'The value is required to not be empty!';
        }

        if (!validator) {
            return true;
        }

        return validator(input);
    };
}

function isEmpty(value) {
    if (value === null) {
        return true;
    }

    if (isArrayLike(value)) {
        return !value.length;
    }

    if (isPlainObject(value)) {
        return !Object.keys(value).length;
    }
}
