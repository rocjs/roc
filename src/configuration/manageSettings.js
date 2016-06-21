import merge from '../helpers/merge';

import { getConfig, setConfig } from './manageConfig';

/**
 * Gets the settings in the configuration object.
 *
 * Will by default get all settings.
 *
 * @param {string} [key] - The settings key to fetch.
 *
 * @returns {rocSettings|Object} - The application settings object.
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
 *
 * @param {!rocSettings} settingsObject - A settings object.
 *
 * @returns {rocSettings} - The settings object.
 */
export function appendSettings(settingsObject) {
    setConfig(merge(getConfig(), { settings: settingsObject }));
    return getSettings();
}
