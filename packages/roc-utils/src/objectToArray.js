/**
 * Takes a object and transforms it into an array where the key is used as name property
 * If the input already is an array the input will be returned
 *
 * @example
 * {
 *   list: {
 *     description: "Hello World"
 *   }
 * }
 * =>
 * [{
 *   name: 'list',
 *   description: "Hello World"
 * }]
 */
export default function objectToArray(obj = {}) {
    if (Array.isArray(obj)) {
        // In the future we should throw an exception here,
        // by keeping this here for now we will be able to feel out
        // this new structure and feel if it is the right fit
        return obj;
    }

    return Object.getOwnPropertyNames(obj)
        .map((name) => ({
            ...obj[name],
            name,
        }));
}
