import 'source-map-support/register';

import { isArray as lodashIsArray, isString as lodashIsString, isBoolean as lodashIsBoolean, isFunction, isRegExp }
    from 'lodash';

/**
 * Validates an array using a validator.
 *
 * @param {function|RegExp} validator - The validator to use on the elements in the array
 * @return {function} Returns a function that takes a value and that returns true or false if valid or not
 */
export function isArray(validator) {
    return (input) => {
        if (!lodashIsArray(input)) {
            return false;
        }

        return isArrayOrSingle(validator)(input);
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
            if (!assert(value, validator)) {
                return false;
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
    return lodashIsString(value);
}

/**
 * Validates an string.
 *
 * @param {object} value - Something to validate
 * @return {boolean} Returns if valid or not
 */
export function isBoolean(value) {
    return lodashIsBoolean(value);
}

/**
 * Validates an string.
 *
 * @param {object} value - Something to validate
 * @return {boolean} Returns if valid or not
 */
export function isInteger(value) {
    return Number.isInteger(value);
}

/**
 * Validates an string.
 *
 * @param {object} value - Something to validate
 * @return {boolean} Returns if valid or not
 */
export function isPath(value) {
    return isString(value);
}

/**
 * Helper to use a validator.
 *
 * @param {object} value - Something to validate
 * @param {function|RegExp} validator - A validator
 * @return {boolean} Returns if valid or not
 */
export function assert(value, validator) {
    if (isFunction(validator)) {
        return validator(value);
    } else if (isRegExp(validator)) {
        return validator.test(value.toString());
    }

    throw new Error('Structure of configuration does not align with validation.');
}
