const initCLI = require('roc-cli').initCLI;

const plugins = require('../lib/defaultPlugins').default;

module.exports = (directory, isLocal) => {
    initCLI({
        currentCLI: require.resolve('roc-cli/lib/runCLI'),
        directory,
        isWrapperLocal: isLocal,
        packageJSON: require('../package.json'),
        // Default plugins that we want to use
        plugins,
    });
};
