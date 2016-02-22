import { isObject } from 'lodash';
import { fileExists, getRocDependencies, getPackageJson } from '../../helpers';

/**
 * Validates if a directory seems to be a Roc application project.
 * A valid Roc project should have a package.json file that contains some dependecy that match 'roc-*' or
 * a `roc.config.js` file.
 *
 * @param {string} directory - The directory to validate.
 *
 * @returns {boolean} - Whether or not it is a valid Roc project.
 */
export function validRocProject(directory) {
    const packageJson = getPackageJson(directory);

    return !(!isObject(packageJson) ||
        !fileExists('roc.config.js', directory) && !getRocDependencies(packageJson).length);
}
