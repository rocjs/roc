import { appendSettings } from '../../configuration/manageSettings';
import addRaw from '../../configuration/addRaw';
import runHook from '../../hooks/runHook';
import validateSettingsWrapper from '../../validation/validateSettingsWrapper';

/* eslint-disable no-param-reassign */
export default function validateAndUpdateSettings(context, validate = false) {
    if (validate) {
        const config = context.config || {};
        const meta = context.meta || {};
        validateSettingsWrapper(config.settings, meta.settings);
    }

    // Add RAW configuration
    context.config = addRaw(context.config);

    runHook('roc')('update-settings', () => context.config.settings)(
        (newSettings) => { context.config.settings = appendSettings(newSettings, context.config); }
    );

    return context;
}
/* eslint-enable */
