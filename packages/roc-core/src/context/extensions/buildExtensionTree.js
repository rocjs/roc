import getExtensions from './steps/getExtensions';
import processDevExports from './steps/processDevExports';
import processNormalExports from './steps/processNormalExports';
import runPostInits from './steps/runPostInits';

const log = require('debug')('roc:core:extensionBuilder');

/**
 * Builds the complete configuration objects.
 */
export default function buildExtensionTree(context, packages, plugins, checkRequired = true, dependencyContext) {
    const completed = (state) => {
        const totalTime = process.hrtime(state.temp.startTime);
        log(`Completed loading extensions ${((totalTime[0] * 1000) + (totalTime[1] / 1000000)).toFixed(0)}ms`);
        return state;
    };

    log('Loading extensions…');
    return [
        getExtensions('package')(packages),
        getExtensions('plugin')(plugins),
        processDevExports,
        processNormalExports,
        runPostInits,
        completed,
    ].reduce(
        (state, process) => process(state),
        // Initial state
        {
            context,

            settings: {
                checkRequired,
            },

            temp: {
                postInits: [],
                extensionsDevelopmentExports: {},
                extensionsNormalExports: {},
                startTime: process.hrtime(),
            },

            dependencyContext: dependencyContext || ({
                extensionsDependencies: {},
                pathsToExtensions: {},
            }),
        },
    );
}
