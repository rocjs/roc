import { getAbsolutePath } from '../helpers';
import buildCompleteConfig from './helpers';
import { getHooks } from '../hooks';
import { getActions } from '../hooks/actions';

/**
 * Builds the Roc configuration object without running the cli.
 *
 * Will not manage overrides.
 *
 * @param {string} dirPath - The directory path to create the configuration from.
 * @param {string} applicationConfigPath - The path to use to read configuration file.
 *
 * @returns {Object} - An object containing appConfig, config, meta, hooks and actions from {@link rocCommandObject}
 */
export default function getConfiguration(dirPath, applicationConfigPath) {
    const path = getAbsolutePath(dirPath);

    // Build the complete config object
    return buildCompleteConfig(false, undefined, undefined, undefined, path, applicationConfigPath, true, false)
        .then(({ packageConfig, config: configObject, meta: metaObject, dependencies, ...rest }) => {
             // FIXME This is not the same rocCommandObject that we have in index.js and that is what I want
            return {
                configObject,
                metaObject,
                packageConfig,
                hooks: getHooks(),
                actions: getActions(),
                dependencies,
                ...rest
            };
        });
}
