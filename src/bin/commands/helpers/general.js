import 'source-map-support/register';

import path from 'path';
import { isObject } from 'lodash';
import { getConfig } from '../../../configuration';

function getPackageJson(dirPath) {
    dirPath = dirPath || process.cwd();
    try {
        return require(path.join(dirPath, 'package.json'));
    } catch (e) {
        return null;
    }
}

function getRocDependency(dependencies) {
    if (dependencies) {
        for (const dep of Object.keys(dependencies)) {
            if (/roc(-.+)/.test(dep)) {
                return dep;
            }
        }
    }

    return false;
}

function validate(packageJson) {
    if (!isObject(packageJson)) {
        console.log('You are not in a node project.');
        console.log('Make sure you are calling this command from the root of a node project.\n');
        return false;
    }

    const config = getConfig();
    const hasRocConfig = isObject(config) && Object.keys(config).length > 0;
    const hasRocDependency = !!getRocDependency(packageJson.dependencies);

    if (!hasRocConfig && !hasRocDependency) {
        console.log('You are not in a Roc project.');
        console.log('Make sure you are calling this command from the root of a Roc project.\n');
        return false;
    }

    return true;
}

export function validRocProject(dirPath) {
    return validate(getPackageJson(dirPath));
}
