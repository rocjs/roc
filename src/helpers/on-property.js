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
