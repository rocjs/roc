import { getAbsolutePath } from '../helpers';

import initContext from './initContext';
import validateAndUpdateSettings from './helpers/validateAndUpdateSettings';

/**
 * Builds the Roc configuration object without running the cli.
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
