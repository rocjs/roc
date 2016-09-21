import fs from 'fs';
import { join } from 'path';

import log from '../log/default/small';
import getAlphaExtensionsThatAreNotLocked, { officialExtensions }
    from '../context/dependencies/getAlphaExtensionsThatAreNotLocked';

export default function freeze({ context: { packageJSON, directory } }) {
    const toUpdate = getAlphaExtensionsThatAreNotLocked(packageJSON);

    if (toUpdate) {
        const newPackageJSON = { ...packageJSON };

        toUpdate.dependencies.forEach((dependency) => {
            console.log(dependency);
            newPackageJSON.dependencies[dependency] = officialExtensions[dependency];
        });

        toUpdate.devDependencies.forEach((dependency) => {
            console.log(dependency);
            newPackageJSON.devDependencies[dependency] = officialExtensions[dependency];
        });

        fs.writeFileSync(join(directory, 'package.json'), JSON.stringify(newPackageJSON, null, 2) + '\n');

        log.success('Locked Roc dependencies in package.json');
        log.log('  Remove node_modules and run npm install again to complete the process.');
    } else {
        log.info('Seems like you already have locked the versions.');
    }
}
