import { getAbsolutePath } from '../helpers';
import runHook from '../hooks/runHook';
import { appendSettings } from '../configuration/manageSettings';

import initContext from './initContext';

/**
 * Builds the Roc configuration object without running the cli.
 *
 * Will not manage overrides.
 *
 * @param {string} dirPath - The directory path to create the configuration from.
 * @param {string} projectConfigPath - The path to use to read configuration file.
 *
 * @returns {Object} - An object containing appConfig, config, meta, hooks and actions from {@link rocCommandObject}
 */
export default function getContext(dirPath, projectConfigPath) {
    // Build the complete config object
    return initContext({
        directory: getAbsolutePath(dirPath),
        projectConfigPath,
        verify: false,
        runtime: false
    })
    // FIXME Temp
    .then((context) => {
        runHook('roc')('update-settings', () => context.config.settings)(
            (newSettings) => context.config.settings = appendSettings(newSettings, context.config)
        );
        return {
            ...context,
            configObject: context.config,
            metaObject: context.meta
        };
    });
}
