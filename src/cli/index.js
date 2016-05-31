import minimist from 'minimist';
import { isString } from 'lodash';

import { execute } from './execute';
import { getAbsolutePath } from '../helpers';
import { validate } from '../validation';
import { merge, appendConfig, appendSettings } from '../configuration';
import buildDocumentationObject from '../documentation/build-documentation-object';
import {
    default as buildCompleteConfig,
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
import { checkGroup, generateAliases } from './utils';
import addOverrides from '../configuration/override';

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
    const {
        _, h, help, V, verbose, v, version, c, config, d, directory, ...restOptions
    } = minimist(argv.slice(2));

    // The first should be our command if there is one
    let [groupOrCommand, ...args] = _;

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
    return buildCompleteConfig(verboseMode, undefined, undefined, initalConfig,
        initalMeta, dirPath, applicationConfigPath, true)
        .then(({ packageConfig, config: configObject, meta: metaObject, dependencies }) => {
            // If we have no command we will display some help information about all possible commands
            if (!groupOrCommand) {
                return console.log(
                    generateCommandsDocumentation(packageConfig.commands, metaObject.commands, info.name)
                );
            }

            // Check if we are in a subgroup
            const result = checkGroup(packageConfig.commands, metaObject.commands, groupOrCommand, args, info.name);
            if (!result) {
                return undefined;
            }

            let {
                commands,
                metaCommands,
                command,
                parents
            } = result;

            let suggestions = Object.keys(commands);

            // If there is no direct match we will search through the tree after a match
            if (!commands[command]) {
                const aliases = generateAliases(commands, metaCommands, command, parents);
                if (!aliases) {
                    return undefined;
                } else if (aliases.commands) {
                    commands = aliases.commands;
                    metaCommands = aliases.metaCommands;
                    parents = aliases.parents;
                }
                suggestions = suggestions.concat(aliases.mappings);
            }

            if (!commands[command]) {
                return console.log(feedbackMessage(
                    errorLabel('Error', 'Invalid command'),
                    getSuggestions([command], suggestions)
                ));
            }

            // Show command help information if requested
            // Will ignore application configuration
            if (help || h) {
                return console.log(generateCommandDocumentation(packageConfig.settings, metaObject.settings,
                    metaCommands, command, info.name, parents));
            }

            const parsedArguments = parseArguments(command, metaCommands, args);

            let documentationObject;
            // Only parse arguments if the command accepts it
            if (metaCommands && metaCommands[command] && metaCommands[command].settings) {
                // Get config from application and only parse options that this command cares about.
                const filter = metaCommands[command].settings === true ? [] : metaCommands[command].settings;
                documentationObject = buildDocumentationObject(configObject.settings, metaObject.settings, filter);
            }

            const { settings, parsedOptions } =
                parseOptions(restOptions, getMappings(documentationObject), command, metaCommands);

            configObject = merge(configObject, {
                settings
            });

            // Validate configuration
            if (metaCommands && metaCommands[command] && metaCommands[command].settings) {
                validate(configObject.settings, metaObject.settings, metaCommands[command].settings);
            }

            // Does this after the validation so that things set by the CLI always will have the highest priority
            configObject = addOverrides(configObject);
            configObject = merge(configObject, {
                settings
            });

            // Set the configuration object
            appendConfig(configObject);

            // Run hook to make it possible for extensions to update the settings before anything other uses them
            runHookDirectly({extension: 'roc', name: 'update-settings'}, [configObject.settings],
                (newSettings) => appendSettings(newSettings)
            );

            if (invoke) {
                // If string run as shell command
                if (isString(commands[command])) {
                    return execute(commands[command])
                        .catch(process.exit);
                }

                // Run the command
                return commands[command]({
                    verbose: verboseMode,
                    directory: dirPath,
                    info,
                    configObject,
                    metaObject,
                    packageConfig,
                    parsedArguments,
                    parsedOptions,
                    hooks: getHooks(),
                    actions: getActions(),
                    // TODO Document this
                    dependencies
                });
            }
        });
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

    return runCli({
        version: version,
        name: name
    });
}
