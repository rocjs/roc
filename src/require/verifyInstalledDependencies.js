import { join } from 'path';

import semver from 'semver';

import fileExists from '../helpers/fileExists';

/*
 A mismatch is one of the following:
 - Not in the package.json (One of the reasons for this is to avoid transitive dependencies)
 - Not the correct version installed
*/
export default function verifyInstalledDependencies(directory, dependencies = {}) {
    const projectJSON = require(join(directory, 'package.json'));
    const mismatches = [];
    const allDependencies = {
        ...projectJSON.dependencies,
        ...projectJSON.devDependencies
    };
    Object.keys(dependencies).forEach((name) => {
        const requested = dependencies[name];
        const current = allDependencies[name];
        const installedVersion = fileExists(join(directory, 'node_modules', name, 'package.json')) &&
            require(join(directory, 'node_modules', name, 'package.json')).version;
        if (
            !current ||
            !semver.satisfies(installedVersion, requested.version)
        ) {
            mismatches.push({
                name: name,
                current: installedVersion,
                requested: requested.version,
                extension: {
                    name: requested.extension,
                    path: requested.context
                },
                inPackageJSON: current
            });
        }
    });
    return mismatches;
}
