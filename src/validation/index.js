import 'source-map-support/register';

import chalk from 'chalk';
import { isPlainObject, isFunction, isRegExp } from 'lodash';

/**
 * Helper to use a validator.
 *
 * @param {object} value - Something to validate.
 * @param {function|RegExp} validator - A validator.
 * @return {boolean} - If valid or not.
 */
export function isValid(value, validator) {
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
            validateMightThrow(settings, metaSettings.validations);
        } else {
            toValidate.forEach((group) => {
                validateMightThrow(settings[group], metaSettings.validations && metaSettings.validations[group]);
            });
        }
    } catch (err) {
        /* eslint-disable no-process-exit, no-console */
        console.log(chalk.bgRed('Validation problem') + ' Configuration was not valid.\n');
        console.log(err.message);
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
export function validateMightThrow(settings, validations) {
    // If no meta configuration or validation is provided it is valid
    if (!validations) {
        return;
    }

    // validation fields to process one by one
    const validateKeys = Object.keys(validations);

    for (const validateKey of validateKeys) {
        const configValue = settings[validateKey];
        const validator = validations[validateKey];

        // process validation nodes recursively
        if (isPlainObject(validator) && isPlainObject(configValue)) {
            validateMightThrow(configValue, {
                ...validator
            });
        } else {
            assertValid(configValue, validateKey, validator);
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

function assertValid(value, validateKey, validator) {
    const result = isValid(value, validator);
    if (result !== true) {
        throwError(validateKey, result, value);
    }
}
