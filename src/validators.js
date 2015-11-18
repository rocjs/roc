import 'source-map-support/register';

import { isArray as lodashIsArray, isString as lodashIsString, isBoolean as lodashIsBoolean } from 'lodash';
import { assert } from './helpers';

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
