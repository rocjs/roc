import readInstalled from 'read-installed';
import semver from 'semver';

/*
 A mismatch is one of the following:
 - Not in the package.json (One of the reasons for this is to avoid transitive dependencies)
 - Not the correct version installed
*/
export default function verifyInstalledDependencies(directory, dependencies = {}) {
    return new Promise((resolve, reject) => {
        readInstalled(directory, { depth: 0 }, function(err, data) {
            if (err) {
                reject(err);
            }

            const mismatches = [];
            const allDependencies = {
                ...data._dependencies,
                ...data.devDependencies
            };
            Object.keys(dependencies).forEach((name) => {
                const requested = dependencies[name];
                const current = allDependencies[name];
                const installedVersion = data.dependencies[name] && data.dependencies[name].version;
                if (
                    !current ||
                    !semver.satisfies(installedVersion, requested.version)
                ) {
                    mismatches.push({
                        name: name,
                        current: installedVersion,
                        requested: requested,
                        inPackageJson: !!current
                    });
                }
            });
            resolve(mismatches);
        });
    });
}
