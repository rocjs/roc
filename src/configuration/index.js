import deepExtend from 'deep-extend';

import { getApplicationConfig } from './helpers';
import { buildCompleteConfig } from '../cli/helpers';
import { feedbackMessage, infoLabel } from '../helpers/style';

const debug = require('debug')('roc:configuration');

/* Make sure that we only print some feedback once */
let onceSettings = true;

/* Using global variables here to make sure that we can access the values set from different projects.
 * This guarantees that the variables will live outside the require cache, something that we need for stability.
 */
global.roc = global.roc || {};
global.roc.config = global.roc.config || undefined;

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
 * Will try to init the configuration if not done previously.
 *
 * @param {boolean} [tryInit=true] - If the function should try to init the configuration object
 *
 * @returns {rocConfig} - The application configuration object.
 */
export function getConfig(tryInit = true) {
    // Try to load the configuration if we haven't at this point.
    if (tryInit && global.roc.config === undefined && !process.env.ROC_CONFIG_SETTINGS) {
        console.log(feedbackMessage(
            infoLabel('Info', 'Configuration'),
            'It seems that you are launching a Roc application without using the Roc CLI, we will now load ' +
            'the configuration separately for you instead.'
        ));
        const { config } = buildCompleteConfig(false, getApplicationConfig());
        global.roc.config = config;
    }

    if (onceSettings && process.env.ROC_CONFIG_SETTINGS) {
        onceSettings = false;

        if (global.roc.config && global.roc.config.settings && Object.keys(global.roc.config.settings).length > 0 &&
            process.env.ROC_CONFIG_SETTINGS
        ) {
            console.log(feedbackMessage(
                infoLabel('Info', 'Configuration'),
                'You have settings defined on the environment variable ROC_CONFIG_SETTINGS ' +
                'and they will be appended to the settings. Will append the following:\n' +
                JSON.stringify(process.env.ROC_CONFIG_SETTINGS, null, 2)
            ));
        }

        appendSettings(JSON.parse(process.env.ROC_CONFIG_SETTINGS));
    }

    return global.roc.config;
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
    debug('Appending settings to the configuration object.');
    global.roc.config = merge(getConfig(), { settings: settingsObject });
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
    debug('Appending to configuration object.');
    global.roc.config = merge(getConfig(false), configObject);
    return getConfig();
}
