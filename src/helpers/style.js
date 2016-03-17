import chalk from 'chalk';
import redent from 'redent';

/**
 * Formats a string suitable for error output.
 *
 * @param {string} text - The text to format for errors.
 *
 * @returns {string} - The formatted text.
 */
export function error(text) {
    return chalk.red(text);
}

/**
 * Formats a string suitable for warnings.
 *
 * @param {string} text - The text to format for warnings.
 *
 * @returns {string} - The formatted text.
 */
export function warning(text) {
    return chalk.yellow(text);
}

/**
 * Formats a string suitable for confirmations.
 *
 * @param {string} text - The text to format for confirmations.
 *
 * @returns {string} - The formatted text.
 */
export function ok(text) {
    return chalk.green(text);
}

/**
 * Formats a string suitable for info messages.
 *
 * @param {string} text - The text to format for info messages.
 *
 * @returns {string} - The formatted text.
 */
export function info(text) {
    return chalk.cyan(text);
}

/**
 * Formats a string suitable for error labels.
 *
 * @param {string} label - The label to format for error labels.
 * @param {string} text - The text to format for error labels.
 *
 * @returns {string} - The formatted text.
 */
export function errorLabel(label, text) {
    const infoText = text ? `  ${error(text)}` : '';
    return chalk.bgRed(chalk.white(`  ${label}  `)) + infoText;
}

/**
 * Formats a string suitable for warning labels.
 *
 * @param {string} label - The label to format for warning labels.
 * @param {string} text - The text to format for warning labels.
 *
 * @returns {string} - The formatted text.
 */
export function warningLabel(label, text) {
    const infoText = text ? `  ${warning(text)}` : '';
    return chalk.bgYellow(chalk.black(`  ${label}  `)) + infoText;
}

/**
 * Formats a string suitable for confirmation labels.
 *
 * @param {string} label - The label to format for confirmation labels.
 * @param {string} text - The text to format for confirmation labels.
 *
 * @returns {string} - The formatted text.
 */
export function okLabel(label, text) {
    const infoText = text ? `  ${ok(text)}` : '';
    return chalk.bgGreen(chalk.white(`  ${label}  `)) + infoText;
}

/**
 * Formats a string suitable for info labels.
 *
 * @param {string} label - The label to format for info labels.
 * @param {string} text - The text to format for info labels.
 *
 * @returns {string} - The formatted text.
 */
export function infoLabel(label, text) {
    const infoText = text ? `  ${info(text)}` : '';
    return chalk.bgCyan(chalk.black(`  ${label}  `)) + infoText;
}

/**
 * Build a feedback message to be printed to the console.
 *
 * @param {string} label - The label to use, should be the output from one of the label functions.
 * @param {string} message - The message related to the feedback message.
 * @param {string} location - Where the message occurred.
 *
 * @returns {string} - The formatted text.
 */
export function feedbackMessage(label, message, location) {
    const locationMessage = location ?
        `\n${chalk.gray('Occurred in ' + chalk.underline(location))}\n` :
        '';

    return label +
        redent(`

${message}
${locationMessage}`, 2);
}
