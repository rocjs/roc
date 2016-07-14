import getExtensions from './steps/getExtensions';
import processDevExports from './steps/processDevExports';
import runPostInits from './steps/runPostInits';

const log = require('debug')('roc:core:extensionBuilder');

/**
 * Builds the complete configuration objects.
 *
 * @param {string[]} packages - The packages to load into Roc.
 * @param {string[]} plugins - The plugins to load into Roc.
 * @param {rocConfig} baseConfig - The base configuration.
 * @param {rocMetaConfig} baseMeta - The base meta configuration.
 * @param {object} baseCommands - The base commands.
 * @param {string} [directory=process.cwd()] - The directory to resolve relative paths from.
 * @param {boolean} [verbose=true] - If verbose mode should be enabled, logs some extra information.
 * @param {boolean} [checkRequired=true] - If dependencies should be verified in extensions.
 *
 * @returns {Object} - The final state after loading all extensions.
 * @property {rocConfig} config - The final configuration, with application configuration.
 * @property {rocMetaConfig} meta - The merged meta configuration.
 * @property {Object[]} projectExtensions - The extensions that was loaded successfully from the project.
 * @property {Object[]} usedExtensions - All of the loaded extensions.
 */
export default function buildExtensionTree(context, packages, plugins, directory, verbose, checkRequired) {
    const completed = (state) => {
        let totalTime = process.hrtime(state.temp.startTime);
        log(`Completed loading extensions ${(totalTime[0] * 1000 + totalTime[1] / 1000000).toFixed(0)}ms`);
        return state;
    };

    log('Loading extensions…');
    return [
        getExtensions('package')(packages),
        getExtensions('plugin')(plugins),
        processDevExports,
        runPostInits,
        completed
    ].reduce(
        (state, process) => process(state),
        // Initial state
        {
            context,

            settings: {
                checkRequired,
                verbose,
                directory
            },

            temp: {
                postInits: [],
                extensionsDevelopmentExports: {},
                startTime: process.hrtime()
            },

            dependencyContext: {
                extensionsDependencies: {},
                pathsToExtensions: {}
            }
        });
}
