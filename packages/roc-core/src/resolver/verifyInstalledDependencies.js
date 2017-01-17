import { join } from 'path';

import { fileExists } from 'roc-utils';
import semver from 'semver';

/*
 A mismatch is one of the following:
 - Not in the package.json (One of the reasons for this is to avoid transitive dependencies)
 - Not the correct version installed
*/
export default function verifyInstalledDependencies(directory, dependencies = {}) {
    const projectJSON = require(join(directory, 'package.json')); // eslint-disable-line
    const mismatches = [];
    const allDependencies = {
        ...projectJSON.dependencies,
        ...projectJSON.devDependencies,
    };
    Object.keys(dependencies).forEach((name) => {
        const requested = dependencies[name];
        const current = allDependencies[name];

        const packageJSON = join(directory, 'node_modules', name, 'package.json');
        const installedVersion = fileExists(packageJSON) && require(packageJSON).version; // eslint-disable-line

        if (
            !current ||
            !semver.satisfies(installedVersion, requested.version)
        ) {
            mismatches.push({
                name,
                current: installedVersion,
                requested: requested.version,
                extension: {
                    name: requested.extension,
                    path: requested.context,
                },
                inPackageJSON: current,
            });
        }
    });
    return mismatches;
}
