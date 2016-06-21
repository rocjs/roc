import { isPlainObject } from 'lodash';

import isValid from './helpers/isValid';
import throwValidationError from './helpers/throwValidationError';
import { REQUIRED_ERROR } from './validators/required';

/**
 * Validates the provided configuration object.
 *
 * @param {rocSettings} settings - The settings object to validate.
 * @param {Object} validations - The meta configuration object that has information about how to validate.
 * @throws {Error} throws error if the configuration is invalid
 */
export default function validateSettings(settings = {}, meta = {}, allowRequiredFailure = false) {
    const validateKeys = Object.keys(meta);

    for (const validateKey of validateKeys) {
        const configValue = settings[validateKey];
        const validator = meta[validateKey].validator;

        // process validation nodes recursively
        if (isPlainObject(configValue) && isPlainObject(meta[validateKey])) {
            validateSettings(configValue, meta[validateKey], allowRequiredFailure);
        } else {
            assertValid(configValue, validateKey, validator, allowRequiredFailure);
        }
    }
}

function assertValid(value, validateKey, validator, allowRequiredFailure = false) {
    const result = isValid(value, validator);
    if (
        !(allowRequiredFailure && result === REQUIRED_ERROR) &&
        result !== true
    ) {
        throwValidationError(validateKey, result, value);
    }
}
