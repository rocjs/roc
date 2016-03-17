/**
 * Given an input the function will return an array.
 *
 * @param {object} input - The input to be converted.
 *
 * @returns {object[]} - The converted result.
 */
export default function toArray(input) {
    let parsed;
    try {
        parsed = JSON.parse(input);
    } catch (err) {
        // Ignore this case
    }

    if (Array.isArray(parsed)) {
        return parsed;
    }

    return input.toString().split(',');
}
