import 'source-map-support/register';

import path from 'path';
import fs from 'fs';
import colors from 'colors/safe';
import deepExtend from 'deep-extend';

let onceApp = true;
let onceTemp = true;

let applicationConfigPath = '';
let temporaryConfig = {};

/**
 * Merges two configuration objects
 *
 * @param {!object} a - configuration object to merge into
 * @param {!object} b - configuration object that overwrites the other
 * @returns {object} The merged configuration object
 */
export function merge(a, b) {
    return deepExtend({}, a, b);
}

/**
 * Gets the application configuration by reading a file
 *
 * Will give a warning if ROC_CONFIG has been set since that will then be used as the path to get the configuration
 * file.
 *
 * Reads configuration files in this manner:
 * 1. Environment variable ROC_CONFIG
 * 2. A path that has been set using {@link setApplicationConfig}
 * 3. Default by trying to read "roc.config.js" in the current working directory
 * 4. Return a empty object
 *
 * @returns {object} The application configuration object
 * @throws {Error} When an invalid path override is specified
 */
export function getApplicationConfig() {
    if (applicationConfigPath && process.env.ROC_CONFIG && onceApp) {
        onceApp = false;
        console.log(colors.red('You have configured a location for the application configuration file but the ' +
            'environment variable ROC_CONFIG is set and that will be used instead. The path that will be used is ' +
            process.env.ROC_CONFIG
        ));
    }

    const configPath = process.env.ROC_CONFIG || applicationConfigPath;

    // path explicitly overriden. throw exception if override is invalid file
    if (configPath && !fs.statSync(configPath).isFile()) {
        throw new Error(`Configuration path points to unaccessable file: ${configPath}`);
    }

    // return correct project configuration with fallback to empty object
    try {
        return require(configPath || path.join(process.cwd(), 'roc.config.js')).config;
    } catch (error) {
        return {};
    }
}

/**
 * Gets the application configuration path
 *
 * @returns {string} Returns either the value for the environment variable ROC_CONFIG or the internal
 * applicationConfigPath
 */
export function getApplicationConfigPath() {
    return process.env.ROC_CONFIG || applicationConfigPath;
}

/**
 * Sets a path for where the application configuration file is located
 *
 * Used in {@link getApplicationConfig}
 *
 * @param {!object} configPath - path to the configuration file
 */
export function setApplicationConfig(configPath) {
    if (configPath) {
        applicationConfigPath = configPath;
    }
}

/**
 * Gets the temporary configuration object
 *
 * Will give a warning if ROC_CONFIG_OBJECT has been set since that will then be used over anything else provided.
 *
 * Reads configuration objects in this manner:
 * 1. Environment varaible ROC_CONFIG_OBJECT
 * 2. A object that has been set using {@link setTemporaryConfig}
 *
 * @returns {object} The application configuration object
 */
export function getTemporaryConfig() {
    if (Object.keys(temporaryConfig).length > 0 && process.env.ROC_CONFIG_OBJECT && onceTemp) {
        onceTemp = false;
        console.log(colors.red('You have configured a temporary configuration object but the environment ' +
            'variable ROC_CONFIG_OBJECT is set and that will be used instead. The object that will be used is ' +
            process.env.ROC_CONFIG_OBJECT
        ));
    }

    if (process.env.ROC_CONFIG_OBJECT) {
        return JSON.parse(process.env.ROC_CONFIG_OBJECT);
    }

    return temporaryConfig;
}

/**
 * Sets a temporary configuration object
 *
 * Will merge the already existing configuration object meaning that this function can be called multiple times and
 * the configuration will be a merge of all the calls.
 *
 * Used in {@link getTemporaryConfig}
 *
 * @param {!object} configObject - a temporary configuration object
 */
export function setTemporaryConfig(configObject) {
    temporaryConfig = merge(temporaryConfig, configObject);
}

/**
 * Gets the final configuration object
 *
 * Will merge the provided configuration object with the application configuration and the temporary configuration
 * object.
 *
 * This means that the temporary configuration has the highest priority, then application configuration and last the
 * provided one (the default).
 *
 * Important to remember to call this whenever either the application or the temporary configuration has changed.
 *
 * @param {!object} [config] - a default configuration object
 * @returns {object} The final configuration object
 */
export function getFinalConfig(config = {}) {
    return deepExtend({}, config, getApplicationConfig(), getTemporaryConfig());
}

/**
 * Validates the provided configuration object
 *
 * @todo Implement
 *
 * @param {object} config - the configuration object to validate
 * @param {object} metaConfig - the meta configuration object that has information about how to validate
 * @throws {Error} throws error if the configuration is invalid
 */
export function validate(config, metaConfig) {
    /* eslint-disable */
    metaConfig;
    /* eslint-enable */
}

/**
 * Generates documentation for the provided configuration object
 *
 * @todo Implement
 *
 * @param {object} config - the configuration object to generate documentation for
 * @param {object} metaConfig - the meta configuration object that has information about the configuration object
 * @returns {object} Some configuration documentation
 */
export function documentation(config, metaConfig) {
    return console.log('Does nothing yet.', config, metaConfig);
}
