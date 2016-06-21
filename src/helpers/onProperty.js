/**
 * Sorter for an object on a property
 *
 * @param {string} property - The property to sort on.
 *
 * @returns {number} - The sort value for that property.
 */
export default function onProperty(property) {
    return (a, b) => {
        if (a[property] > b[property]) {
            return 1;
        }
        if (a[property] < b[property]) {
            return -1;
        }

        return 0;
    };
}
