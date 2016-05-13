/**
 * Given an input is a converter, it will return a converted result.
 *
 * @param {...function} converters - This is the converters.
 *
 * @returns {object} - The converted result.
 */
export default function convert(...converters) {
    if (!converters.length) {
        throw new Error('You need to use at least one converter.');
    }

    return (input, defaultValue, name) => {
        for (let converter of converters) {
            const res = converter(input, defaultValue, name);

            // toBoolean will return false as a valid value
            if (!res && res !== false) {
                continue;
            }

            return res;
        }
    };
}
