import path from 'path';
import fs from 'fs';

import log from 'roc-logger/default/small';

export default ({
    directory,
    isLocal = false,
    packageJSON,
    plugins = [],
}) => {
    const options = {
        info: {
            name: 'roc',
            package: packageJSON.name,
            version: packageJSON.version,
        },
        plugins,
    };

    // Look for local version of the core to use over the bundled one
    const currentCore = require.resolve('roc-core/lib');
    const localCore = path.join(directory, 'node_modules', 'roc-core', 'lib', 'index.js');

    if (!isLocal && currentCore !== localCore && fs.existsSync(localCore)) {
        log.info('Found a local version of roc-core, will use that over the global one', '\n');
        require(localCore).runCLI(options);
    } else {
        require('roc-core').runCLI(options);
    }
};
