import 'source-map-support/register';

import {
  isArray as lodashIsArray,
  isString as lodashIsString,
  isBoolean as lodashIsBoolean,
  isPlainObject as lodashIsPlainObject
} from 'lodash';
import { isValid } from './helpers';

/**
 * Validates an array using a validator.
 *
 * @param {function|RegExp} validator - The validator to use on the elements in the array
 * @return {function} Returns a function that takes a value and that returns true or false if valid or not
 */
export function isArray(validator) {
    return (input) => {
        if (!lodashIsArray(input)) {
            return 'Was not an array!';
        }

        return isArrayOrSingle(validator)(input);
    };
}

/**
 * Validates an object using a validator.
 *
 * @param {function|RegExp} validator - The validator to use on the elements in the object
 * @return {function} Returns a function that takes a value and that returns true or false if valid or not
 */
export function isObject(validator) {
    return (input) => {
        if (!lodashIsPlainObject(input)) {
            return 'Was not an object!';
        }

        if (!validator) {
            return true;
        }

        return Object.keys(input).map((key) => validator(input[key]))
            .reduce((a, b) => a && b, true);
    };
}

/**
 * Validates an pontential array using a validator.
 *
 * Allows that a single value is given.
 *
 * @param {function|RegExp} validator - The validator to use on the elements in the array
 * @return {function} Returns a function that takes a value and that returns true or false if valid or not
 */
export function isArrayOrSingle(validator) {
    return (input) => {
        const array = [].concat(input);
        for (const value of array) {
            const result = isValid(value, validator);
            if (result !== true) {
                return result;
            }
        }

        return true;
    };
}

/**
 * Validates an string.
 *
 * @param {object} value - Something to validate
 * @return {boolean} Returns if valid or not
 */
export function isString(value) {
    if (!lodashIsString(value)) {
        return 'Was not a string!';
    }

    return true;
}

/**
 * Validates an string.
 *
 * @param {object} value - Something to validate
 * @return {boolean} Returns if valid or not
 */
export function isBoolean(value) {
    if (!lodashIsBoolean(value)) {
        return 'Was not a boolean!';
    }

    return true;
}

/**
 * Validates an string.
 *
 * @param {object} value - Something to validate
 * @return {boolean} Returns if valid or not
 */
export function isInteger(value) {
    if (!Number.isInteger(value)) {
        return 'Was not an integer!';
    }

    return true;
}

/**
 * Validates an string.
 *
 * @param {object} value - Something to validate
 * @return {boolean} Returns if valid or not
 */
export function isPath(value) {
    if (!isString(value)) {
        return 'Was not a path!';
    }

    return true;
}

/**
 * Validates against a list of validators
 *
 * @param {...function} validators - Validators to validate against
 * @return {function} Returns a function that takes a value and that returns true or false if valid or not
 */
export function oneOf(...validators) {
    return (input) => {
        const invalid = [];
        for (const validator of validators) {
            const result = validator(input);
            if (result === true) {
                return true;
            }
            invalid.push(result);
        }

        return 'Was not any of the possible types:\n' +
            invalid.reduce((prev, next) => prev + '\n' + next, '');
    };
}

/**
 * Marks that the value is required
 *
 * @param {function} validator - Validator to validate against
 * @return {function} Returns a function that takes a value and that returns true or false if valid or not
 */
export function required(validator) {
    return (input) => {
        if (
            !input && input !== false ||
            (lodashIsArray(input) || lodashIsString(input)) && input.length === 0 ||
            lodashIsPlainObject(input) && Object.keys(input).length === 0
        ) {
            return 'A value was required but none was given!';
        }

        return validator(input);
    };
}
