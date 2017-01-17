import { bold, yellow } from 'chalk';
import log from 'roc-logger/default/large';
import merge from 'roc-utils/lib/merge';
import { getContext, setContext } from 'roc-context';

import { appendSettings } from './manageSettings';

/* Make sure that we only print some feedback once */
let onceSettings = true;

/**
 * Gets the current configuration object.
 */
export function getConfig(customState) {
    if (customState) {
        return customState;
    }

    const context = getContext();

    // Try to load the configuration if we haven't at this point.
    if (context.config === undefined) {
        log.error(
            'It seems that you are launching a Roc project without using the Roc CLI.\n' +
            'Please use the CLI or add the Roc runtime to your project.\n\n' +
            `${bold('Example:')}\n` +
            `${yellow('import \'roc/runtime/register\';')} or ${yellow('require(\'roc/runtime/register\');')}\n\n` +
            'See the documentation for more information.',
            'Configuration',
        );
    }

    if (onceSettings && process.env.ROC_CONFIG_SETTINGS) {
        onceSettings = false;

        const environmentSettings = JSON.parse(process.env.ROC_CONFIG_SETTINGS);

        if (context.config &&
            context.config.settings &&
            Object.keys(context.config.settings).length > 0 &&
            process.env.ROC_CONFIG_SETTINGS
        ) {
            log.info(
                `You have settings defined on the environment variable ${bold('ROC_CONFIG_SETTINGS')} ` +
                'and they will be appended to the settings. Will append the following:\n' +
                JSON.stringify(environmentSettings, null, 2),
                'Configuration',
            );
        }

        appendSettings(environmentSettings);
    }

    return getContext().config;
}

/**
 * Appends to the configuration object.
 *
 * Will merge with the already existing configuration object meaning that this function can be called multiple times and
 * the configuration will be a merge of all those calls.
 */
export function appendConfig(config) {
    setContext({
        ...getContext(),
        config: merge(getConfig(), config),
    });

    return getConfig();
}

export function setConfig(newConfig, setGlobal = true) {
    if (setGlobal) {
        setContext({
            ...getContext(),
            config: newConfig,
        });
    }

    return newConfig;
}
