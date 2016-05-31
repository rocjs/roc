import { isObject } from 'lodash';
import {
    getRocPackageDependencies,
    getRocNamespacedDependencies,
    getPackageJson
} from './';

/**
 * Validates if a directory seems to be a Roc application project.
 * A valid Roc project should have a package.json file that contains some dependency that match 'roc-package-*' or
 * a `roc.config.js` file.
 *
 * @param {string} directory - The directory to validate.
 *
 * @returns {boolean} - Whether or not it is a valid Roc project.
 */
export default function validRocProject(directory) {
    const packageJson = getPackageJson(directory);

    return isObject(packageJson) && (
        packageJson.roc ||
        getRocPackageDependencies(packageJson).length > 0 ||
        getRocNamespacedDependencies(packageJson).length > 0);
}
