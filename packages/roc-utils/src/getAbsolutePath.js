import path from 'path';

/**
* Makes a path absolute if not already is that.
*
* @param {string} filepath - The filepath to make absolute.
* @param {string} [directory=process.cwd()] - The directory to resolve relative paths to. By default will use the
*     current working directory.
*
* @returns {string} - An absolute path.
*/
export default function getAbsolutePath(filepath, directory = process.cwd()) {
    if (filepath) {
        return path.isAbsolute(filepath) ?
            filepath :
            path.join(directory, filepath);
    }

    return undefined;
}
