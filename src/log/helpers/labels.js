import {
    white, black, red, yellow, green, cyan,
    bgRed, bgYellow, bgGreen, bgCyan
} from 'chalk';

/**
 * Formats a string suitable for error labels.
 *
 * @param {string} label - The label to format for error labels.
 * @param {string} text - The text to format for error labels.
 *
 * @returns {string} - The formatted text.
 */
export function error(label, text) {
    const title = text ? `  ${red(text)}` : '';
    return bgRed(white(`  ${label}  `)) + title;
}

/**
 * Formats a string suitable for warning labels.
 *
 * @param {string} label - The label to format for warning labels.
 * @param {string} text - The text to format for warning labels.
 *
 * @returns {string} - The formatted text.
 */
export function warn(label, text) {
    const title = text ? `  ${yellow(text)}` : '';
    return bgYellow(black(`  ${label}  `)) + title;
}

/**
 * Formats a string suitable for confirmation labels.
 *
 * @param {string} label - The label to format for confirmation labels.
 * @param {string} text - The text to format for confirmation labels.
 *
 * @returns {string} - The formatted text.
 */
export function log(label, text) {
    const title = text ? `  ${green(text)}` : '';
    return bgGreen(white(`  ${label}  `)) + title;
}

/**
 * Formats a string suitable for info labels.
 *
 * @param {string} label - The label to format for info labels.
 * @param {string} text - The text to format for info labels.
 *
 * @returns {string} - The formatted text.
 */
export function info(label, text) {
    const title = text ? `  ${cyan(text)}` : '';
    return bgCyan(black(`  ${label}  `)) + title;
}
