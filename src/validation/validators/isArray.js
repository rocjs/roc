import { isArray as isArrayLodash } from 'lodash';
import isValid from '../helpers/isValid';
import createInfoObject from '../helpers/createInfoObject';
import toArray from '../../converters/toArray';

/**
 * Validates an array using a validator.
 *
 * @param {function|RegExp} validator - The validator to use on the elements in the array.
 * @return {function} - A function that takes a value and that returns true or false if valid or not.
 */
export default function isArray(validator) {
    return (input, info) => {
        if (info) {
            return createInfoObject({
                validator,
                converter: (converter) => toArray(converter),
                wrapper: (wrap) => (`[${wrap}]`),
                canBeEmpty: true
            });
        }

        if (input === undefined || input === null) {
            return true;
        }

        if (!isArrayLodash(input)) {
            return 'Was not an array!';
        }

        for (const value of input) {
            const result = isValid(value, validator);
            if (result !== true) {
                return result;
            }
        }

        return true;
    };
}
