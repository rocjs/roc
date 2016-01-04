import 'source-map-support/register';

import path from 'path';
import colors from 'colors/safe';
import semver from 'semver';

export function getPackageJson(dirPath) {
    dirPath = dirPath || process.cwd();
    try {
        // If we can't find this we are not in a valid Roc project
        return require(path.join(dirPath, 'package.json')).roc;
    } catch (e) {
        return null;
    }
}

function validate(requiredRocVersion) {
    if (!requiredRocVersion) {
        console.log('You are not in a Roc project.');
        console.log('Make sure you are calling this command from the root of a Roc project.\n');
        return false;
    }

    // if product requires an alpha version of cli an exact version match is not needed
    if (requiredRocVersion.indexOf('-alpha') > -1) {
        return true;
    }

    if (!semver.satisfies(getVersion(), requiredRocVersion)) {
        const state = semver.ltr(getVersion(), requiredRocVersion) ? 'newer' : 'older';
        console.log(`Your Roc application has a dependency on a ${state} version of the Roc CLI.`);

        if (state === 'newer') {
            console.log(`Please update the CLI to at least ${requiredRocVersion}.\n`);
        } else {
            console.log('Please either upgrade the project to use a newer version of the CLI or downgrade the CLI ' +
                ` to at least ${requiredRocVersion}.\n`);
        }

        return false;
    }

    return true;
}

function getRocExtensionPath() {
    const projectPackageJson = require(path.join(process.cwd(), 'package.json'));
    let rocDependecy = getRocDependency(projectPackageJson.dependencies);
    if (!rocDependecy) {
        console.log('Did not found any Roc dependency in the normal dependencies, will search in devDependencies.\n');
        rocDependecy = getRocDependency(projectPackageJson.devDependencies);
    }

    return path.join(process.cwd(), 'node_modules', rocDependecy);
}

function getRocDependency(dependencies) {
    if (dependencies) {
        for (const dep of Object.keys(dependencies)) {
            if (/roc(-.+)/.test(dep)) {
                console.log(`Found ${colors.bold(dep)} and will use that as base for the project if not overriden.\n`);

                return dep;
            }
        }
    }

    return false;
}

export function getBaseRocExtension() {
    const rocExtensionPath = getRocExtensionPath();
    const packageJson = require(path.join(rocExtensionPath, 'package.json'));

    validate(packageJson.roc);

    return require(path.join(rocExtensionPath, packageJson.main));
}

export function getVersion() {
    return require('../../../../package.json').version;
}

export function validRocProject(dirPath) {
    return validate(getPackageJson(dirPath));
}
