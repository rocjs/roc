import 'source-map-support/register';

import chalk from 'chalk';
import { isPlainObject } from 'lodash';

import { isValid } from './helpers';

/**
 * Validates the provided configuration object
 *
 * @param {object} config - the configuration object to validate
 * @param {object} metaConfig - the meta configuration object that has information about how to validate
 * @param {array|boolean} toValidate - What groups on settings that should be validated.
 * @emits {process.exit} if the config was invalid it will print the reason and terminate with status 1
 */
export function validate(config, metaConfig, toValidate = true) {
    try {
        if (toValidate === true) {
            validateMightThrow(config, metaConfig);
        } else {
            toValidate.forEach((group) => {
                validateMightThrow(config[group], metaConfig[group]);
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
 * Validates the provided configuration object
 *
 * @param {object} config - the configuration object to validate
 * @param {object} metaConfig - the meta configuration object that has information about how to validate
 * @throws {Error} throws error if the configuration is invalid
 */
export function validateMightThrow(config, metaConfig) {
    // if no meta configuration or validation is provided it is valid
    if (!metaConfig || !metaConfig.validations) {
        return;
    }

    // validation fields to process one by one
    const validateKeys = Object.keys(metaConfig.validations);

    for (const validateKey of validateKeys) {
        const configValue = config[validateKey];
        const validator = metaConfig.validations[validateKey];

        // process validation nodes recursively
        if (isPlainObject(validator) && isPlainObject(configValue)) {
            validateMightThrow(configValue, {
                validations: {
                    ...validator
                }
            });
        } else {
            assertValid(configValue, validateKey, validator);
        }
    }
}

function assertValid(value, validateKey, validator) {
    const result = isValid(value, validator);
    if (result !== true) {
        throwError(validateKey, result, value);
    }
}

function throwError(field, message, value) {
    message = message && message + '\n';
    const val = value ? `Received: ${value} - ` : '';
    throw new Error(
        `Validation failed for field ${chalk.underline(field)} - ` +
        val +
        `${message || ''}`
    );
}
