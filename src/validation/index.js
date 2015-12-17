import 'source-map-support/register';

import chalk from 'chalk';
import { isPlainObject } from 'lodash';

import { isValid } from './helpers';

/**
 * Validates the provided configuration object
 *
 * @param {object} config - the configuration object to validate
 * @param {object} metaConfig - the meta configuration object that has information about how to validate
 * @emits {process.exit} if the config was invalid it will print the reason and terminate with status 1
 */
export function validate(config, metaConfig) {
    try {
        validateMightThrow(config, metaConfig);
    } catch (err) {
        /* eslint-disable no-process-exit, no-console */
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
    if (!metaConfig || !metaConfig.validation) {
        return;
    }

    // validation fields to process one by one
    const validateKeys = Object.keys(metaConfig.validation);

    for (const validateKey of validateKeys) {
        const configValue = config[validateKey];
        const validator = metaConfig.validation[validateKey];

        // process validation nodes recursively
        if (isPlainObject(validator) && isPlainObject(configValue)) {
            validateMightThrow(configValue, {
                validation: {
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
    throw new Error(
        `Configuration validation failed for field ${chalk.bold(field)}.\n` +
        `Received: ${value}\n` +
        `${message || ''}`
    );
}
