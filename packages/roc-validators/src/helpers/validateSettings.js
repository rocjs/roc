import { isPlainObject, isFunction } from 'lodash';

import { REQUIRED_ERROR } from '../required';

import isValid from './isValid';
import throwValidationError from './throwValidationError';

/**
 * Validates the provided settings objects and might throw.
 */
export default function validateSettings(settings = {}, meta = {}, allowRequiredFailure = false, path = 'settings') {
    Object.keys(meta).forEach((validateKey) => {
        const configValue = settings[validateKey];
        const validator = meta[validateKey].validator && isFunction(meta[validateKey].validator) ?
            meta[validateKey].validator :
            undefined;
        const newPath = path ? `${path}.${validateKey}` : validateKey;

        // process validation nodes recursively
        if (isPlainObject(configValue) && !validator) {
            validateSettings(configValue, meta[validateKey], allowRequiredFailure, newPath);
        } else {
            assertValid(configValue, newPath, validator, allowRequiredFailure);
        }
    });
}

function assertValid(value, key, validator, allowRequiredFailure = false) {
    const result = isValid(value, validator);
    if (
        !(allowRequiredFailure && result === REQUIRED_ERROR) &&
        result !== true
    ) {
        throwValidationError(...processResult(key, result, value), 'property');
    }
}

function processResult(key, result, value) {
    if (isPlainObject(result)) {
        return [
            `${key}${result.key}`,
            result.message,
            result.value,
        ];
    }
    return [
        key,
        result,
        value,
    ];
}
