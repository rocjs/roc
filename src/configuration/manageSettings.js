import merge from '../helpers/merge';

import { getConfig, setConfig } from './manageConfig';

/**
 * Gets the settings in the configuration object.
 *
 * Will by default get all settings.
 */
export function getSettings(key, state) {
    const settings = getConfig(state).settings;
    return key ? settings[key] : settings;
}

/**
 * Appends settings to the configuration object.
 *
 * Will merge with the already existing settings object meaning that this function can be called multiple times and
 * the settings will be a merge of all those calls.
 */
export function appendSettings(settingsObject, state) {
    return setConfig(
        merge(
            getConfig(true, state),
            { settings: settingsObject }
        ),
        state
    ).settings;
}
