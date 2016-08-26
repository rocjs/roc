import { isString } from 'lodash';
import minimist from 'minimist';

import { appendSettings } from '../configuration/manageSettings';
import { setConfig } from '../configuration/manageConfig';
import { setContext } from '../context/helpers/manageContext';
import addRaw from '../configuration/addRaw';
import buildDocumentationObject from '../documentation/buildDocumentationObject';
import execute from '../execute';
import getAbsolutePath from '../helpers/getAbsolutePath';
import getSuggestions from '../helpers/getSuggestions';
import initContext from '../context/initContext';
import log from '../log/default/large';
import merge from '../helpers/merge';
import runHook from '../hooks/runHook';
import validateSettingsWrapper from '../validation/validateSettingsWrapper';

import checkGroup from './commands/helpers/checkGroup';
import generateAliases from './commands/helpers/generateAliases';
import generateCommandDocumentation from './commands/documentation/generateCommandDocumentation';
import generateCommandsDocumentation from './commands/documentation/generateCommandsDocumentation';
import getMappings from './commands/getMappings';
import parseArguments from './commands/parseArguments';
import parseOptions from './commands/parseOptions';

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
export default function runCli({
    info = { version: 'Unknown', name: 'Unknown' },
    commands: initalCommands,
    argv = process.argv,
    invoke = true,
}) {
    const {
        _, h, help, V, verbose, v, version, c, config, d, directory, b, 'better-feedback': betterFeedback,
        ...restOptions,
    } = minimist(argv.slice(2));

    // The first should be our command if there is one
    const [groupOrCommand, ...args] = _;

    // If version is selected output that and stop
    if (version || v) {
        return console.log(info.version);
    }

    if (betterFeedback || b) {
        require('source-map-support').install(); // eslint-disable-line
        require('loud-rejection')(); // eslint-disable-line
    }

    // Possible to set a command in verbose mode
    const verboseMode = !!(verbose || V);

    // Get the project configuration path
    const projectConfigPath = c || config;

    // Get the directory path
    const dirPath = getAbsolutePath(directory || d);

    // Set temporary context
    setContext({
        verbose: verboseMode,
        directory: dirPath,
    });

    // Initialize the complete context
    const context = initContext({
        verbose: verboseMode,
        commands: initalCommands,
        directory: dirPath,
        projectConfigPath,
        name: info.name,
    });

    // If we have no command we will display some help information about all possible commands
    if (!groupOrCommand) {
        return console.log(
            generateCommandsDocumentation(context.commands, info.name)
        );
    }

    // Check if we are in a subgroup
    const result = checkGroup(context.commands, groupOrCommand, args, info.name);
    if (!result) {
        return undefined;
    }

    let {
        commands,
        command, // eslint-disable-line
        parents,
    } = result;

    let suggestions = Object.keys(commands);

    // If there is no direct match we will search through the tree after a match
    if (!commands[command]) {
        const aliases = generateAliases(commands, command, parents);
        if (!aliases) {
            return undefined;
        } else if (aliases.commands) {
            commands = aliases.commands;
            parents = aliases.parents;
        }
        suggestions = suggestions.concat(aliases.mappings);
    }

    if (!commands[command]) {
        log.error(
            getSuggestions([command], suggestions),
            'Invalid command'
        );
    }

    // Show command help information if requested
    // Will ignore application configuration
    if (help || h) {
        return console.log(generateCommandDocumentation(context.extensionConfig.settings, context.meta.settings,
            commands, command, info.name, parents));
    }

    const parsedArguments = parseArguments(command, commands, args);

    let documentationObject;
    // Only parse arguments if the command accepts it
    if (commands[command] && commands[command].settings) {
        // Get config from application and only parse options that this command cares about.
        const filter = commands[command].settings === true ? [] : commands[command].settings;
        documentationObject = buildDocumentationObject(context.config.settings, context.meta.settings, filter);
    }

    const { settings, parsedOptions } =
        parseOptions(restOptions, getMappings(documentationObject), commands[command]);

    const configToValidate = merge(context.config, {
        settings,
    });

    // Validate configuration
    if (commands[command] && commands[command].settings) {
        validateSettingsWrapper(configToValidate.settings, context.meta.settings, commands[command].settings);
    }

    // Does this after the validation so that things set by the CLI always will have the highest priority
    // We do not want to do validation on RAW configuration
    context.config = merge(addRaw(context.config), {
        settings,
    });

    // Set the configuration object
    setConfig(context.config);

    // Run hook to make it possible for extensions to update the settings before anything other uses them
    // This means that they can inspect what has been defined by other extensions, the user through config
    // and through command line options
    runHook('roc')('update-settings', () => context.config.settings)(
        (newSettings) => { context.config.settings = appendSettings(newSettings, context.config); }
    );

    // Update the configuration object
    setConfig(context.config);

    if (invoke) {
        // If string run as shell command
        if (isString(commands[command].command)) {
            return execute(commands[command].command)
                .catch(process.exit);
        }

        // Run the command
        return commands[command].command({
            info,
            arguments: parsedArguments,
            options: parsedOptions,

            // Roc Context
            context,
        });
    }

    return undefined;
}
