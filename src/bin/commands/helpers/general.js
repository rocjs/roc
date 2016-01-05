import 'source-map-support/register';

import { isObject } from 'lodash';
import { getConfig } from '../../../configuration';
import { getRocDependencies, getPackageJson } from '../../../helpers';

export function validRocProject(dirPath) {
    const packageJson = getPackageJson(dirPath);

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
