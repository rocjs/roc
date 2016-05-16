/**
 * Given an input the function will return an array.
 *
 * @param {function} converter - The converter to use for the elements in the array.
 *
 * @returns {function} - A converter that will convert the input to an array.
 */
export default function toArray(converter = (input) => input) {
    return (input) => {
        let parsed;
        try {
            parsed = JSON.parse(input);
        } catch (err) {
            // Ignore this case
        }

        if (Array.isArray(parsed)) {
            return parsed;
        }

        return input
            .toString()
            .split(',')
            .map((value) => converter(value.trim()));
    };
}
