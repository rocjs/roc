import 'source-map-support/register';

import chalk from 'chalk';
import deepExtend from 'deep-extend';

/* Make sure that we only print some feedback once */
let onceSettings = true;

/* Using global varaibles here to make sure that we can access the values set from different projects.
 * This guarantees that the varaibles will live outside the require cache, something that we need for stability.
 */
global.rocConfig = global.rocConfig || {};

/**
 * Merges two configuration objects.
 *
 * @param {!Object} a - Configuration object to base the merge on.
 * @param {!Object} b - Configuration object that is merged into the first, overwriting the first one.
 *
 * @returns {Object} - The merged configuration object
 */
export function merge(a, b) {
    return deepExtend({}, a, b);
}

/**
 * Gets the current configuration object.
 *
 * @returns {rocConfig} - The application configuration object.
 */
export function getConfig() {
    if (onceSettings && process.env.ROC_CONFIG_SETTINGS) {
        onceSettings = false;

        if (Object.keys(global.rocConfig.settings).length > 0 && process.env.ROC_CONFIG_SETTINGS) {
            console.log(
                chalk.yellow('You have settings defined on the environment variable ROC_CONFIG_SETTINGS ' +
                'and they will be appended to the settings. Will append the following:\n' +
                JSON.stringify(process.env.ROC_CONFIG_SETTINGS, null, 2))
            , '\n');
        }

        appendSettings(JSON.parse(process.env.ROC_CONFIG_SETTINGS));
    }

    return global.rocConfig;
}

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
    global.rocConfig = merge(getConfig(), { settings: settingsObject });
    return getSettings();
}

/**
 * Appends to the configuration object.
 *
 * Will merge with the already existing configuration object meaning that this function can be called multiple times and
 * the configuration will be a merge of all those calls.
 *
 * @param {!rocConfig} configObject - A configuration object.
 *
 * @returns {rocConfig} - The configuration object.
 */
export function appendConfig(configObject) {
    global.rocConfig = merge(getConfig(), configObject);
    return getConfig();
}
