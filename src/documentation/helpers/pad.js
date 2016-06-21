/**
 * Returns a string to pad with.
 *
 * @param {number} length - The desired length of the generated string.
 * @param {string} [character=" "] - The character to repat.
 *
 * @returns {string} - A string matching the input.
 */
export default function pad(length, character = ' ') {
    return Array(length + 1).join(character);
}
