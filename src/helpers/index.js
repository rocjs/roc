import 'source-map-support/register';

import path from 'path';
import fs from 'fs';

/**
* Makes a path absolute if not already is that.
*
* @param {string} filepath - The filepath to make absolute.
* @param {string} [directory=process.cwd()] - The directory to resolve realative paths to. By default will use the
*     current working directory.
* @returns {string} An absolute path.
*/
export function getAbsolutePath(filepath, directory = process.cwd()) {
    if (filepath) {
        return path.isAbsolute(filepath) ?
            filepath :
            path.join(directory, filepath);
    }
}

export function fileExists(filepath, directory) {
    filepath = getAbsolutePath(filepath, directory);
    try {
        return fs.statSync(filepath).isFile();
    } catch (error) {
        return false;
    }
}

export function getRocDependencies(packageJson) {
    return [
        ...Object.keys(packageJson.dependencies || {}),
        ...Object.keys(packageJson.devDependencies || {})
    ]
    .filter(dependecy => /^roc(-.+)/.test(dependecy));
}

export function getPackageJson(directory = process.cwd()) {
    if (fileExists('package.json', directory)) {
        return require(path.join(directory, 'package.json'));
    }

    return null;
}
