import 'source-map-support/register';

import { isObject } from 'lodash';
import { getConfig } from '../../../configuration';
import { getRocDependencies, getPackageJson } from '../../../helpers';

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

    if (!isObject(packageJson)) {
        console.log('You are not in a Node project.');
        console.log('Make sure you are calling this command from the root of a Node project.\n');
        return false;
    }

    const config = getConfig();
    const hasRocConfig = isObject(config) && Object.keys(config).length > 0;
    const hasRocDependency = getRocDependencies(packageJson).length;

    if (!hasRocConfig && !hasRocDependency) {
        console.log('You are not in a Roc project.');
        console.log('Make sure you are calling this command from the root of a Roc project.\n');
        return false;
    }

    return true;
}
