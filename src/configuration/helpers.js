import fs from 'fs';
import chalk from 'chalk';

import { getAbsolutePath } from '../helpers';
import { feedbackMessage, errorLabel, warningLabel } from '../helpers/style';

const debug = require('debug')('roc:configuration');

/* Make sure that we only print some feedback once */
let onceApp = true;

/**
 * Gets the application configuration by reading a file.
 *
 * Will give a warning if ROC_CONFIG_PATH has been set since that will then be used as the path to get the configuration
 * file, even if one is provided to the function.
 *
 * Reads configuration files in this manner:
 * 1. Environment variable ROC_CONFIG_PATH.
 * 2. Path given as applicationConfigPath.
 * 3. Default by trying to read "roc.config.js" in the current working directory.
 * 4. Return a empty object along with a warning.
 *
 * @param {string} applicationConfigPath - Path to application configuration file. Can be either relative or absolute.
 * @param {string} [directory=process.cwd()] - The directory to resolve relative paths to. By default will use the
 *     current working directory.
 * @param {boolean} [verbose=false] - If extra information should be printed.
 *
 * @returns {object} - The application configuration object.
 * @throws {Error} - When an invalid path override is specified.
 */
export function getApplicationConfig(applicationConfigPath, directory = process.cwd(), verbose = false) {
    debug(`Getting application config for application path '${applicationConfigPath}' and directory '${directory}'`);
    if (applicationConfigPath === false) {
        return {};
    }

    const configPath = getAbsolutePath(process.env.ROC_CONFIG_PATH || applicationConfigPath, directory);

    if (onceApp && applicationConfigPath && process.env.ROC_CONFIG_PATH) {
        onceApp = false;
        console.log(feedbackMessage(
            warningLabel('Warning', 'Configuration'),
            'You have configured a location for the application configuration file but the ' +
            'environment variable ' + chalk.bold('ROC_CONFIG_PATH') + ' is set and that will be used instead. The ' +
            'path that will be used is ' + configPath
        ));
    }

    try {
        if (configPath) {
            const stats = fs.statSync(configPath);
            if (!stats.isFile()) {
                throw new Error('Not a file.');
            }
        }
    } catch (err) {
        manageUnaccessibleFile(configPath);
    }

    // Return correct project configuration with fallback to empty object
    const appConfigPath = configPath || getAbsolutePath('roc.config.js', directory);
    try {
        const config = require(appConfigPath);

        if (Object.keys(config).length === 0) {
            console.log(feedbackMessage(
                warningLabel('Warning', 'Configuration'),
                'The configuration file at ' + chalk.bold(appConfigPath) + ' was empty.'
            ));
        }

        return config;
    } catch (err) {
        if (err.constructor === SyntaxError) {
            console.log(feedbackMessage(
                warningLabel('Warning', 'Configuration'),
                'Something is wrong with the configuration file at ' + chalk.bold(appConfigPath) +
                ' and it will be ignored. Received: ' + chalk.underline(err.message)
            ));
        } else if (verbose) {
            console.log(feedbackMessage(
                warningLabel('Warning', 'Configuration'),
                `Could not find the configuration file at ${chalk.bold(appConfigPath)}.`
            ));
        }

        return {};
    }
}

function manageUnaccessibleFile(configPath) {
    console.log(feedbackMessage(
        errorLabel('Error', 'Configuration'),
        `Configuration path points to unaccessible file: ${configPath}`
    ));
    /* eslint-disable no-process-exit */
    process.exit(1);
    /* eslint-enable */
}
