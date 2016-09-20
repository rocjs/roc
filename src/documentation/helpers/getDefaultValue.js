import { isRegExp } from 'lodash';

/**
 * Converts an object to a string.
 *
 * @param {Object} object - The object to convert to a string.
 *
 * @returns {string|null} - The converted object or null if the object is empty.
 */
export default function getDefaultValue(object) {
    if (object === undefined) {
        return undefined;
    }

    // Make sure we get something sensible when having a RegExp
    if (isRegExp(object)) {
        return object.toString();
    }

    return JSON.stringify(object);
}
