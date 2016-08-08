import runHook from '../../hooks/runHook';
import { appendSettings } from '../../configuration/manageSettings';
import validateSettingsWrapper from '../../validation/validateSettingsWrapper';

/* eslint-disable no-param-reassign */
export default function validateAndUpdateSettings(context, validate = false) {
    if (validate) {
        const config = context.config || {};
        const meta = context.meta || {};
        validateSettingsWrapper(config.settings, meta.settings);
    }

    runHook('roc')('update-settings', () => context.config.settings)(
        (newSettings) => { context.config.settings = appendSettings(newSettings, context.config); }
    );

    return context;
}
/* eslint-enable */
