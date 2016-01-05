import 'source-map-support/register';

import path from 'path';
import fs from 'fs';

/**
* Makes a path absolute if not already is that.
*
* @param {string} filepath - The filepath to make absolute.
* @param {string} [directory=process.cwd()] - The directory to resolve relative paths to. By default will use the
*     current working directory.
*
* @returns {string} - An absolute path.
*/
export function getAbsolutePath(filepath, directory = process.cwd()) {
    if (filepath) {
        return path.isAbsolute(filepath) ?
            filepath :
            path.join(directory, filepath);
    }
}

/**
* Verifys if a file exists.
*
* @param {string} filepath - The filepath to check.
* @param {string} [directory] - The directory to base the filepath on.
*
* @returns {boolean} - Whether or not it is a file.
*/
export function fileExists(filepath, directory) {
    filepath = getAbsolutePath(filepath, directory);
    try {
        return fs.statSync(filepath).isFile();
    } catch (error) {
        return false;
    }
}

/**
 * Gets the Roc dependencies from a `package.json`.
 *
 * @param {Object} packageJson - A package.json file to fetch Roc dependencies from.
 *
 * @returns {string[]} - An array with Roc extensions that exists in the `package.json`.
 */
export function getRocDependencies(packageJson) {
    return [
        ...Object.keys(packageJson.dependencies || {}),
        ...Object.keys(packageJson.devDependencies || {})
    ]
    .filter(dependecy => /^roc(-.+)/.test(dependecy));
}

/**
 * Reads a `package.json` file.
 *
 * @param {string} [directory=processs.cwd()] - In what directory to look for the `package.json`.
 *
 * @returns {Object|undefined} - The object in the `package.json` or undefined if it did not exists.
 */
export function getPackageJson(directory = process.cwd()) {
    if (fileExists('package.json', directory)) {
        return require(path.join(directory, 'package.json'));
    }

    return undefined;
}
