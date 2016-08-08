import fs from 'fs';

import getAbsolutePath from './getAbsolutePath';

/**
* Verifies if a folder exists.
*
* @param {string} filepath - The filepath to check. Will make it absolute if not already using {@link getAbsolutePath}.
* @param {string} [directory] - The directory to base the filepath on.
*
* @returns {boolean} - Whether or not it is a file.
*/
export default function folderExists(filepath, directory) {
    const absoluteFilepath = getAbsolutePath(filepath, directory);
    try {
        return fs.statSync(absoluteFilepath).isDirectory();
    } catch (error) {
        return false;
    }
}
