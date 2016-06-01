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
* Verifies if a file exists.
*
* @param {string} filepath - The filepath to check. Will make it absolute if not already using {@link getAbsolutePath}.
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
 * Gets the Roc package dependencies from a `package.json`.
 *
 * @param {Object} packageJson - A package.json file to fetch Roc package dependencies from.
 *
 * @returns {string[]} - An array with Roc packages that exists in the `package.json`.
 */
export function getRocPackageDependencies(packageJson) {
    return [
        ...Object.keys(packageJson.devDependencies || {}),
        ...Object.keys(packageJson.dependencies || {})
    ]
    .filter((dependency) => /^(?:@.*\/)?roc-package(-.+)/.test(dependency));
}

/**
 * Gets the Roc plugin dependencies from a `package.json`.
 *
 * @param {Object} packageJson - A package.json file to fetch Roc plugin dependencies from.
 *
 * @returns {string[]} - An array with Roc plugins that exists in the `package.json`.
 */
export function getRocPluginDependencies(packageJson) {
    return [
        ...Object.keys(packageJson.devDependencies || {}),
        ...Object.keys(packageJson.dependencies || {})
    ]
    .filter((dependency) => /^(?:@.*\/)?roc-plugin(-.+)/.test(dependency));
}

/**
 * Reads a `package.json` file.
 *
 * @param {string} [directory=process.cwd()] - In what directory to look for the `package.json`.
 *
 * @returns {Object|undefined} - The object in the `package.json` or undefined if it did not exists.
 */
export function getPackageJson(directory = process.cwd()) {
    if (fileExists('package.json', directory)) {
        return require(path.join(directory, 'package.json'));
    }

    return undefined;
}
