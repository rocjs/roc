import 'source-map-support/register';

import {
  isArray as lodashIsArray,
  isString as lodashIsString,
  isBoolean as lodashIsBoolean,
  isPlainObject as lodashIsPlainObject
} from 'lodash';
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
 * Validates an object using a validator.
 *
 * @param {function|RegExp} validator - The validator to use on the elements in the object
 * @return {function} Returns a function that takes a value and that returns true or false if valid or not
 */
export function isObject(validator) {
    return (input) => {
        if (!lodashIsPlainObject(input)) {
            return false;
        }

        if (!validator) {
            return true;
        }

        return Object.keys(input).map((key) => validator(input[key]))
            .reduce((a, b) => a && b);
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
 * Validates against a list of validators
 *
 * @param {...function} validators - Validators to validate against
 * @return {function} Returns a function that takes a value and that returns true or false if valid or not
 */
export function oneOf(...validators) {
    return (input) => {
        for (const validator of validators) {
            if (validator(input)) {
                return true;
            }
        }

        return false;
    };
}
