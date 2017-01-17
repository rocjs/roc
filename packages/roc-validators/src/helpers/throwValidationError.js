import { underline } from 'chalk';

/**
 * Throws error for failed validations.
 *
 * @param {string} name - String with the name of what failed the validation.
 * @param {string} message - Potential message from the validating function.
 * @param {object} value - The value that was provided.
 * @param {string} [type='field'] - What the failed validation value was.
 * @throws {Error} - Throws error if the configuration is invalid.
 */
export default function throwValidationError(name, message, value = '[Nothing]', type = 'field') {
    throw new Error(
        `Validation failed for ${type} ${underline(name)}\n` +
        `Received: ${JSON.stringify(value)}.` +
        ` ${message || ''}`,
    );
}
