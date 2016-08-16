import { getAbsolutePath } from '../helpers';

import initContext from './initContext';
import validateAndUpdateSettings from './helpers/validateAndUpdateSettings';

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
export default function buildContext(dirPath, projectConfigPath, validate = true) {
    // Build the complete config object
    const context = initContext({
        directory: getAbsolutePath(dirPath),
        projectConfigPath,
        verify: false,
        runtime: false,
    });

    return validateAndUpdateSettings(context, validate);
}
