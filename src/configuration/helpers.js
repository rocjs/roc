import 'source-map-support/register';

import fs from 'fs';
import chalk from 'chalk';

import { getAbsolutePath } from '../helpers';

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
 * @param {string} [directory=process.cwd()] - The directory to resolve realative paths to. By default will use the
 *     current working directory.
 * @param {boolean} [debug=false] - If extra information should be printed.
 *
 * @returns {object} - The application configuration object.
 * @throws {Error} - When an invalid path override is specified.
 */
export function getApplicationConfig(applicationConfigPath, directory = process.cwd(), debug = false) {
    const configPath = getAbsolutePath(process.env.ROC_CONFIG_PATH || applicationConfigPath, directory);

    if (onceApp && applicationConfigPath && process.env.ROC_CONFIG_PATH) {
        onceApp = false;
        console.log(
            chalk.red('You have configured a location for the application configuration file but the ' +
            'environment variable ' + chalk.bold('ROC_CONFIG_PATH') + ' is set and that will be used instead. The ' +
            'path that will be used is ' + configPath)
        , '\n');
    }

    if (configPath && !fs.statSync(configPath).isFile()) {
        throw new Error(`Configuration path points to unaccessable file: ${configPath}`);
    }

    // Return correct project configuration with fallback to empty object
    const appConfigPath = configPath || getAbsolutePath('roc.config.js', directory);
    try {
        const config = require(appConfigPath);

        if (Object.keys(config).length === 0) {
            console.log(chalk.yellow('The configuration file at ' + chalk.bold(appConfigPath) + ' was empty.'));
        }

        return config;
    } catch (error) {
        if (debug) {
            console.log(chalk.yellow('Could not read the configuration file at ' + chalk.bold(appConfigPath)));
        }
        return {};
    }
}
