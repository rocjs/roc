import { sep } from 'path';

export default function createPathRegExp(path, flags) {
    if (sep === '\\') {
        // eslint-disable-next-line
        path = path.replace(/\\/g, '\\\\');
    }

    return new RegExp(path, flags);
}
