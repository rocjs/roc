import merge from 'roc-utils/lib/merge';

import { getConfig, setConfig } from './manageConfig';

/**
 * Gets the settings in the configuration object.
 *
 * Will by default get all settings.
 */
export function getSettings(key) {
    const settings = getConfig().settings;
    return key ? settings[key] : settings;
}

/**
 * Appends settings to the configuration object.
 *
 * Will merge with the already existing settings object meaning that this function can be called multiple times and
 * the settings will be a merge of all those calls.
 */
export function appendSettings(settingsObject, customState) {
    return setConfig(
        merge(
            getConfig(customState),
            { settings: settingsObject },
        ),
        !customState,
    ).settings;
}
