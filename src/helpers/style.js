import chalk from 'chalk';

/**
* Formats a string suitable for error output
*
* @param {string} text - The text to format for errors
*
* @returns {string} - The formatted text
*/
export function error(text) {
    return chalk.red(text);
}

/**
* Formats a string suitable for warnings
*
* @param {string} text - The text to format for warnings
*
* @returns {string} - The formatted text
*/
export function warning(text) {
    return chalk.yellow(text);
}

/**
* Formats a string suitable for confirmations
*
* @param {string} text - The text to format for confirmations
*
* @returns {string} - The formatted text
*/
export function ok(text) {
    return chalk.green(text);
}

/**
* Formats a string suitable for error labels
*
* @param {string} text - The text to format for error labels
*
* @returns {string} - The formatted text
*/
export function errorLabel(text) {
    return chalk.bgRed(chalk.white(text));
}

/**
* Formats a string suitable for warning labels
*
* @param {string} text - The text to format for warning labels
*
* @returns {string} - The formatted text
*/
export function warningLabel(text) {
    return chalk.bgYellow(chalk.white(text));
}

/**
* Formats a string suitable for confirmation labels
*
* @param {string} text - The text to format for confirmation labels
*
* @returns {string} - The formatted text
*/
export function okLabel(text) {
    return chalk.bgGreen(chalk.white(text));
}
