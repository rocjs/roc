import { isPlainObject } from 'lodash';

import createInfoObject from '../helpers/createInfoObject';
import isValid from '../helpers/isValid';
import toObject from '../../converters/toObject';

/**
 * Validates an object using a validator.
 *
 * @param {function|RegExp} validator - The validator to use on the elements in the object
 * @param {Object} options - Uptions that should be used with the validator
 * @return {function} - A function that takes a value and that returns true or false if valid or not.
 */
export default function isObject(...args) {
    const validator = isPlainObject(args[0]) ? undefined : args[0];
    const { unmanaged = false } = (isPlainObject(args[0]) ? args[0] : args[1]) || {};

    return (input, info) => {
        if (info) {
            return createInfoObject({
                validator,
                converter: () => toObject,
                wrapper: (wrap) => `{${wrap}}`,
                canBeEmpty: true,
                unmanagedObject: unmanaged,
            });
        }

        if (input === undefined || input === null) {
            return true;
        }

        if (!isPlainObject(input)) {
            return 'Was not an object!';
        }

        if (!validator) {
            return true;
        }

        return Object.keys(input).map((key) => isValid(input[key], validator))
            .reduce((a, b) => a === true && b === true, true);
    };
}
