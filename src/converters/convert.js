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

    return (input) => {
        for (const converter of converters) {
            const res = converter(input);

            // false and null is valid results
            if (!res && res !== false && res !== null) {
                continue;
            }

            return res;
        }

        return undefined;
    };
}
