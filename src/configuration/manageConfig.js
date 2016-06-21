import buildContext from '../cli/buildContext';
import log from '../log/default/large';
import merge from '../helpers/merge';

import getApplicationConfig from './getApplicationConfig';
import { appendSettings } from './manageSettings';

/* Make sure that we only print some feedback once */
let onceSettings = true;

/* Using global variables here to make sure that we can access the values set from different projects.
 * This guarantees that the variables will live outside the require cache, something that we need for stability.
 */
global.roc = global.roc || {};
global.roc.config = global.roc.config || undefined;

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
        log.info(
            'It seems that you are launching a Roc application without using the Roc CLI, we will now load ' +
            'the configuration separately for you instead.',
            'Configuration'
        );
        // FIXME Verify this functionality!
        const { config } = buildContext(false, getApplicationConfig());
        global.roc.config = config;
    }

    if (onceSettings && process.env.ROC_CONFIG_SETTINGS) {
        onceSettings = false;

        if (global.roc.config && global.roc.config.settings && Object.keys(global.roc.config.settings).length > 0 &&
            process.env.ROC_CONFIG_SETTINGS
        ) {
            log.info(
                'You have settings defined on the environment variable ROC_CONFIG_SETTINGS ' +
                'and they will be appended to the settings. Will append the following:\n' +
                JSON.stringify(process.env.ROC_CONFIG_SETTINGS, null, 2),
                'Configuration'
            );
        }

        appendSettings(JSON.parse(process.env.ROC_CONFIG_SETTINGS));
    }

    return global.roc.config;
}

/**
 * Appends to the configuration object.
 *
 * Will merge with the already existing configuration object meaning that this function can be called multiple times and
 * the configuration will be a merge of all those calls.
 *
 * @param {!rocConfig} config - A configuration object.
 *
 * @returns {rocConfig} - The configuration object.
 */
export function appendConfig(config) {
    global.roc.config = merge(getConfig(false), config);
    return getConfig();
}

export function setConfig(newConfig) {
    global.roc.config = newConfig;
}
