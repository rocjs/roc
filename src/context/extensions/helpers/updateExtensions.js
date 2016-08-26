import { isPlainObject, union, get } from 'lodash';

// Updates __extensions for an object (current) by adding the values from old if it has the same keys
export default function updateExtensions(current, old) {
    Object.keys(current).forEach((key) => {
        if (key === '__extensions') {
            // eslint-disable-next-line no-param-reassign
            current.__extensions = union(current.__extensions, get(old, '__extensions'));
        } else if (isPlainObject(current[`${key}`])) {
            updateExtensions(current[key], get(old, key));
        }
    });

    return current;
}
