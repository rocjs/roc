import path from 'path';

import fileExists from './fileExists';

/**
 * Reads a `package.json` file.
 *
 * @param {string} [directory=process.cwd()] - In what directory to look for the `package.json`.
 *
 * @returns {Object|undefined} - The object in the `package.json` or undefined if it did not exists.
 */
export default function getPackage(directory = process.cwd()) {
    if (fileExists('package.json', directory)) {
        return require(path.join(directory, 'package.json'));
    }

    return undefined;
}
