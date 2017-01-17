import { appendSettings } from '../../config/manageSettings';
import addRaw from '../../config/addRaw';
import runHook from '../../hooks/runHook';
import validateSettingsWrapper from '../../utils/validateSettingsWrapper';

/* eslint-disable no-param-reassign */
export default function validateAndUpdateSettings(context, validate = false) {
    if (validate) {
        const config = context.config || {};
        const meta = context.meta || {};
        validateSettingsWrapper(config.settings, meta.settings);
    }

    // Add RAW configuration
    context.config = addRaw(context.config);

    runHook('roc-core')('update-settings', () => context.config.settings)(
        (newSettings) => { context.config.settings = appendSettings(newSettings, context.config); },
    );

    return context;
}
/* eslint-enable */
