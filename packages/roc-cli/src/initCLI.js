import path from 'path';
import fs from 'fs';

import updateNotifier from 'update-notifier';
import log from 'roc-logger/default/small';

import getDirectory from './getDirectory';

export default ({
    currentCLI = require.resolve('../lib/runCLI'),
    directory = getDirectory(),
    isWrapperLocal = false,
    packageJSON = require('../package.json'),
    plugins = [],
} = {}) => {
    const localCLI = path.resolve(directory, 'node_modules/roc-cli/lib/runCLI.js');

    if (!isWrapperLocal && currentCLI !== localCLI && packageJSON.name === 'roc-cli') {
        // Are we global?
        if (!fs.existsSync(localCLI)) {
            if (!fs.existsSync(path.resolve(directory, 'node_modules/.bin/roc'))) {
                updateNotifier({ pkg: packageJSON }).notify({ defer: false });
            }

            require(currentCLI).default({ // eslint-disable-line
                directory,
                packageJSON,
                plugins,
            });
        } else {
            log.info('Found a local version of roc-cli that will be used over the global one.');
            require(require.resolve(localCLI)).default({ // eslint-disable-line
                directory,
                isLocal: true,
                packageJSON: require(require.resolve(path.join(directory, 'node_modules', 'roc-cli', 'package.json'))),
                plugins,
            });
        }
    } else {
        // We are running the local version of roc-cli
        require(currentCLI).default({ // eslint-disable-line
            directory,
            isLocal: isWrapperLocal,
            packageJSON,
            plugins,
        });
    }
};
