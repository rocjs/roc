import chalk from 'chalk';
import { isPlainObject, isFunction, isRegExp } from 'lodash';

import { feedbackMessage, errorLabel } from '../helpers/style';

import { REQUIRED_ERROR } from './validators/required';

/**
 * Helper to use a validator.
 *
 * @param {object} value - Something to validate.
 * @param {function|RegExp} validator - A validator.
 * @return {boolean} - If valid or not.
 */
export function isValid(value, validator) {
    // If we have no validator we assume the value to be valid
    if (!validator) {
        return true;
    }

    if (isFunction(validator)) {
        return validator(value);
    } else if (isRegExp(validator)) {
        if (!validator.test(value.toString())) {
            return 'Did not match the regexp: ' + validator;
        }

        return true;
    }

    throw new Error('Structure of configuration does not align with validation.');
}

/**
 * Validates the provided configuration object.
 *
 * @param {rocSettings} settings - The settings object to validate.
 * @param {rocMetaSettings} metaSettings - The meta settings object that has information about how to validate.
 * @param {array|boolean} toValidate - What groups on settings that should be validated.
 * @emits {process.exit} - If the config was invalid it will print the reason and terminate with status 1.
 */
export function validate(settings, metaSettings = {}, toValidate = true) {
    try {
        if (toValidate === true) {
            validateMightThrow(settings, metaSettings);
        } else {
            toValidate.forEach((group) => {
                validateMightThrow(settings[group], metaSettings && metaSettings[group]);
            });
        }
    } catch (err) {
        console.log(feedbackMessage(
            errorLabel('Error', 'Validation Problem'),
            'Configuration was not valid.\n\n' +
            err.message
        ));
        /* eslint-disable no-process-exit */
        process.exit(1);
        /* eslint-enable */
    }
}

/**
 * Validates the provided configuration object.
 *
 * @param {rocSettings} settings - The settings object to validate.
 * @param {Object} validations - The meta configuration object that has information about how to validate.
 * @throws {Error} throws error if the configuration is invalid
 */
export function validateMightThrow(settings = {}, meta = {}, allowRequiredFailure = false) {
    const validateKeys = Object.keys(meta);

    for (const validateKey of validateKeys) {
        const configValue = settings[validateKey];
        const validator = meta[validateKey].validator;

        // process validation nodes recursively
        if (isPlainObject(configValue) && isPlainObject(meta[validateKey])) {
            validateMightThrow(configValue, meta[validateKey], allowRequiredFailure);
        } else {
            assertValid(configValue, validateKey, validator, allowRequiredFailure);
        }
    }
}

/**
 * Throws error for failed validations.
 *
 * @param {string} name - String with the name of what failed the validation.
 * @param {string} message - Potential message from the validating function.
 * @param {object} value - The value that was provided.
 * @param {string} [type='field'] - What the failed validation value was.
 * @throws {Error} - Throws error if the configuration is invalid.
 */
export function throwError(name, message, value, type = 'field') {
    value = value || '[Nothing]';
    throw new Error(
        `Validation failed for ${type} ${chalk.underline(name)} -` +
        ` Received: ${value}.` +
        ` ${message || ''}`
    );
}

function assertValid(value, validateKey, validator, allowRequiredFailure = false) {
    const result = isValid(value, validator);
    if (
        !(allowRequiredFailure && result === REQUIRED_ERROR) &&
        result !== true
    ) {
        throwError(validateKey, result, value);
    }
}
