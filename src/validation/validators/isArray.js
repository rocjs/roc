import { isArray as isArrayLodash, isPlainObject } from 'lodash';

import createInfoObject from '../helpers/createInfoObject';
import isValid from '../helpers/isValid';
import toArray from '../../converters/toArray';
import writeInfoInline from '../helpers/writeInfoInline';

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
                wrapper: (...args) => `Array(${writeInfoInline(...args)})`,
                canBeEmpty: true,
            });
        }

        if (input === undefined || input === null) {
            return true;
        }

        if (!isArrayLodash(input)) {
            return 'Was not an array!';
        }

        for (const index in input) { // eslint-disable-line
            const result = isValid(input[index], validator);
            if (result !== true) {
                if (isPlainObject(result)) {
                    return {
                        key: `${result.key}[${index}]`,
                        value: result.value,
                        message: result.message,
                    };
                }
                return {
                    key: `[${index}]`,
                    value: input[index],
                    message: result,
                };
            }
        }

        return true;
    };
}
