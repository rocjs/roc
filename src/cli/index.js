import minimist from 'minimist';
import { isString } from 'lodash';

import { execute } from './execute';
import { getAbsolutePath } from '../helpers';
import { validate } from '../validation';
import { merge, appendConfig, appendSettings } from '../configuration';
import buildDocumentationObject from '../documentation/build-documentation-object';
import { getApplicationConfig } from '../configuration/helpers';
import {
    buildCompleteConfig,
    generateCommandsDocumentation,
    generateCommandDocumentation,
    parseOptions,
    getMappings,
    parseArguments
} from './helpers';
import getSuggestions from '../helpers/get-suggestions';
import { feedbackMessage, errorLabel } from '../helpers/style';
import { setVerbose } from '../helpers/verbose';
import { getHooks, runHookDirectly } from '../hooks';
import { getActions } from '../hooks/actions';
const debug = require('debug')('roc:core:cli');

/**
 * Invokes the Roc cli.
 *
 * @param {{version: string, name: string}} info - Information about the cli.
 * @param {rocConfig} initalConfig - The inital configuration, will be merged with the selected packages and
 *  application.
 * @param {rocMetaConfig} initalMeta - The inital meta configuration, will be merged with the selected packages.
 * @param {string[]} [argv=process.argv] - From where it should parse the arguments.
 * @param {boolean} [invoke=true] - If the a command should be invoked after initing the configuration.
 *
 * @returns {object} - Returns what the command is returning. If the command is a string command a promise will be
 *  returned that is resolved when the command has been completed.
 */
export function runCli(info = { version: 'Unknown', name: 'Unknown' }, initalConfig, initalMeta,
    argv = process.argv, invoke = true) {
    debug('Getting commandline arguments.');
    const {
        _, h, help, V, verbose, v, version, c, config, d, directory, ...restOptions
    } = minimist(argv.slice(2));

    // The first should be our command if there is one
    const [command, ...args] = _;

    // If version is selected output that and stop
    if (version || v) {
        return console.log(info.version);
    }

    // Possible to set a command in verbose mode
    const verboseMode = !!(verbose || V);
    setVerbose(verboseMode);

    // Get the application configuration path
    const applicationConfigPath = c || config;

    // Get the directory path
    const dirPath = getAbsolutePath(directory || d);

    // Build the complete config object
    debug('Building application config.');
    const applicationConfig = getApplicationConfig(applicationConfigPath, dirPath, verboseMode);

    debug('Building complete context config.');
    let { packageConfig, config: configObject, meta: metaObject } =
        buildCompleteConfig(verboseMode, applicationConfig, undefined, initalConfig, initalMeta, dirPath, true);

    // If we have no command we will display some help information about all possible commands
    if (!command) {
        return console.log(generateCommandsDocumentation(packageConfig, metaObject));
    }

    // If the command does not exist show error
    // Will ignore application configuration
    if (!packageConfig.commands || !packageConfig.commands[command]) {
        return console.log(feedbackMessage(
            errorLabel('Error', 'Invalid Command'),
            getSuggestions([command], Object.keys(packageConfig.commands))
        ));
    }

    // Show command help information if requested
    // Will ignore application configuration
    if (help || h) {
        return console.log(generateCommandDocumentation(packageConfig, metaObject, command, info.name));
    }

    debug('Parsing commandline arguments.');
    const parsedArguments = parseArguments(command, metaObject.commands, args);

    let documentationObject;
    // Only parse arguments if the command accepts it
    if (metaObject.commands && metaObject.commands[command] && metaObject.commands[command].settings) {
        // Get config from application and only parse options that this command cares about.
        const filter = metaObject.commands[command].settings === true ? [] : metaObject.commands[command].settings;
        documentationObject = buildDocumentationObject(configObject.settings, metaObject.settings, filter);
    }

    debug('Parsing commandline options.');
    const { settings, parsedOptions } =
        parseOptions(restOptions, getMappings(documentationObject), command, metaObject.commands);

    configObject = merge(configObject, {
        settings
    });

    // Validate configuration
    if (metaObject.commands && metaObject.commands[command] && metaObject.commands[command].settings) {
        debug('Validating configuration.');
        validate(configObject.settings, metaObject.settings, metaObject.commands[command].settings);
    }

    // Set the configuration object
    debug('Merging configuration to global context.');
    appendConfig(configObject);

    debug('Running hook \'update-settings\'');
    // Run hook to make it possible for extensions to update the settings before anything other uses them
    runHookDirectly({extension: 'roc', name: 'update-settings'}, [configObject.settings],
        (newSettings) => appendSettings(newSettings)
    );

    if (invoke) {
        // If string run as shell command
        if (isString(configObject.commands[command])) {
            debug('Invoking shell command.');
            return execute(configObject.commands[command])
                .catch(process.exit);
        }

        debug('Running command \'%s\'', command);
        // Run the command
        return configObject.commands[command]({
            verbose: verboseMode,
            info,
            configObject,
            metaObject,
            packageConfig,
            parsedArguments,
            parsedOptions,
            hooks: getHooks(),
            actions: getActions()
        });
    }
}

/**
 * Small helper for convenience to init the Roc cli, wraps {@link runCli}.
 *
 * Will enable source map support and better error handling for promises.
 *
 * @param {string} version - The version to be used when requested for information.
 * @param {string} name - The name to be used when display feedback to the user.
 *
 * @returns {object} - Returns what the command is returning. If the command is a string command a promise will be
 *  returned that is resolved when the command has been completed.
 */
export function initCli(version, name) {
    require('source-map-support').install();
    require('loud-rejection')();
    debug('CLI initialized programatically with source-map support and loud-rejection.');

    return runCli({
        version: version,
        name: name
    });
}
