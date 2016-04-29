import { getHooks } from '../../hooks';
import { getActions } from '../../hooks/actions';

import {
    getExtensions,
    runPostInits
} from './helpers';

const debug = require('debug')('roc:core:cli:extensions');

/**
 * Builds the complete configuration objects.
 *
 * @param {string[]} packages - The packages to load into Roc.
 * @param {string[]} plugins - The plugins to load into Roc.
 * @param {rocConfig} baseConfig - The base configuration.
 * @param {rocMetaConfig} baseMeta - The base meta configuration.
 * @param {string} [directory=process.cwd()] - The directory to resolve relative paths from.
 * @param {boolean} [verbose=true] - If verbose mode should be enabled, logs some extra information.
 * @param {boolean} [checkDependencies=true] - If dependencies should be verified in extensions.
 *
 * @returns {Object} - The final state after loading all extensions.
 * @property {rocConfig} config - The final configuration, with application configuration.
 * @property {rocMetaConfig} meta - The merged meta configuration.
 * @property {Object[]} projectExtensions - The extensions that was loaded successfully from the project.
 * @property {Object[]} usedExtensions - All of the loaded extensions.
 */
export default function buildExtensionTree(
    packages, plugins, baseConfig, baseMeta, directory, verbose, checkDependencies
) {
    debug(
        'Building Context Extension Tree (state) for packages [%s] and plugins [%s]',
        packages.join(', ') || '<none>',
        plugins.join(', ') || '<none>'
    );

    return [
        getExtensions('package')(packages, directory),
        getExtensions('plugin')(plugins, directory),
        runPostInits
    ].reduce(
        (state, process) => process(state),
        // Initial state
        {
            checkDependencies,
            verbose,
            config: baseConfig,
            meta: baseMeta,
            postInits: [],
            projectExtensions: [],
            usedExtensions: [],
            actions: getActions(),
            hooks: getHooks()
        });
}
