import { isString } from 'lodash';
import minimist from 'minimist';
import isPromise from 'is-promise';

import { appendSettings, getSettings } from '../configuration/manageSettings';
import { setConfig } from '../configuration/manageConfig';
import { setContext } from '../context/helpers/manageContext';
import addRaw from '../configuration/addRaw';
import buildDocumentationObject from '../documentation/buildDocumentationObject';
import execute from '../execute';
import getAbsolutePath from '../helpers/getAbsolutePath';
import getSuggestions from '../helpers/getSuggestions';
import initContext from '../context/initContext';
import log from '../log/default';
import merge from '../helpers/merge';
import runHook from '../hooks/runHook';
import validateSettingsWrapper from '../validation/validateSettingsWrapper';

import extractCommand from './commands/helpers/extractCommand';
import generateAliases from './commands/helpers/generateAliases';
import generateCommandDocumentation from './commands/documentation/generateCommandDocumentation';
import generateCommandsDocumentation from './commands/documentation/generateCommandsDocumentation';
import getMappings from './commands/getMappings';
import parseArguments from './commands/parseArguments';
import parseOptions from './commands/parseOptions';

/**
 * Invokes the Roc cli.
 * Returns what the command is returning. If the command is a string command a promise will be
 * returned that is resolved when the command has been completed.
 */
export default function runCli({
    info = { version: 'Unknown', name: 'Unknown' },
    commands: initialCommands,
    argv = process.argv,
    invoke = true,
}) {
    const input = parseCliInput(minimist(argv.slice(2), { '--': true }));

    // If version is selected output that and stop
    if (input.coreOptions.version || input.coreOptions.v) {
        return console.log(info.version);
    }

    if (input.coreOptions.betterFeedback || input.coreOptions.b) {
        require('source-map-support').install(); // eslint-disable-line
        require('loud-rejection')(); // eslint-disable-line
    }

    // Possible to set a command in verbose mode
    const verboseMode = !!(input.coreOptions.verbose || input.coreOptions.V);

    // Get the project configuration path
    const projectConfigPath = input.coreOptions.c || input.coreOptions.config;

    // Get the directory path
    const dirPath = getAbsolutePath(input.coreOptions.directory || input.coreOptions.d);

    // Set temporary context
    setContext({
        verbose: verboseMode,
        directory: dirPath,
    });

    // Initialize the complete context
    const context = initContext({
        verbose: verboseMode,
        commands: initialCommands,
        directory: dirPath,
        projectConfigPath,
        name: info.name,
    });

    // If we have no command we will display some help information about all possible commands
    if (!input.groupOrCommand) {
        return console.log(
            generateCommandsDocumentation(context.commands, info.name)
        );
    }

    // Given context commands and user input, extract command data from potentially
    // nested group/command structure
    const commandData = extractCommand(
        context.commands,
        input.groupOrCommand,
        input.argsWithoutOptions,
        info.name
    );

    // command data as string indicates no match, so print the provided feedback
    if (isString(commandData)) {
        return console.log(commandData);
    }

    let commandSuggestions = Object.keys(commandData.commands);

    // If there is no direct match we will search through the tree for a match
    if (!commandData.commands[commandData.commandName]) {
        const commandAliases = generateAliases(
            commandData.commands,
            commandData.commandName,
            commandData.parents
        );

        if (!commandAliases) {
            return undefined;
        } else if (commandAliases.commands) {
            commandData.commands = commandAliases.commands;
            commandData.parents = commandAliases.parents;
        }

        commandSuggestions = commandSuggestions.concat(commandAliases.mappings);
    }

    const command = commandData.commands[commandData.commandName];

    if (!command) {
        log.large.error(
            getSuggestions([commandData.commandName], commandSuggestions),
            'Invalid command'
        );
    }

    // Show command help information if requested
    // Will ignore application configuration
    if (input.coreOptions.help || input.coreOptions.h) {
        return console.log(
            generateCommandDocumentation(
                context.extensionConfig.settings,
                context.meta.settings,
                commandData.commands,
                commandData.commandName,
                info.name,
                commandData.parents
            )
        );
    }

    let documentationObject;
    // Only parse arguments if the command accepts it
    if (command && command.settings) {
        // Get config from application and only parse options that this command cares about.
        const filter = command.settings === true ? [] : command.settings;
        documentationObject = buildDocumentationObject(context.config.settings, context.meta.settings, filter);
    }

    const { settings, parsedOptions } =
        parseOptions(input.extOptions, getMappings(documentationObject), command);

    const configToValidate = merge(context.config, {
        settings,
    });

    // Validate configuration
    if (command && command.settings) {
        validateSettingsWrapper(configToValidate.settings, context.meta.settings, command.settings);
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
    runHook('roc')('update-settings', () => getSettings())(
        (newSettings) => appendSettings(newSettings)
    );

    if (invoke) {
        // If string run as shell command
        if (isString(command.command)) {
            return execute(command.command, {
                context: command.__context,
                args: input.extraArguments,
                cwd: dirPath,
            }).catch((error) => {
                process.exitCode = error.getCode ? error.getCode() : 1;
                log.small.error('A problem happened when running the Roc command');
            });
        }

        const parsedArguments = parseArguments(commandData.commandName, commandData.commands, input.argsWithoutOptions);

        // Run the command
        const commandResult = command.command({
            info,
            arguments: parsedArguments,
            options: parsedOptions,
            extraArguments: input.extraArguments,
            // Roc Context
            context,
        });

        if (isPromise(commandResult)) {
            return commandResult
                .catch((error) => {
                    log.small.warn('A problem happened when running the Roc command', error);
                });
        }

        return commandResult;
    }

    return undefined;
}

/**
 * Wrap all relevant data from minimist with descriptive names
 */
function parseCliInput(minimistData) {
    /* eslint-disable object-property-newline */
    const {
        _,
        h, help,
        V, verbose,
        v, version,
        c, config,
        d, directory,
        b, 'better-feedback': betterFeedback,
        '--': extraArguments,
        ...extOptions,
    } = minimistData;

    // The first should be our command or commandgroup, if there is one
    const [groupOrCommand, ...argsWithoutOptions] = _;

    return {
        groupOrCommand, // commandgroup or command
        coreOptions: { // options managed and parsed by core
            h, help,
            V, verbose,
            v, version,
            c, config,
            d, directory,
            b, betterFeedback,
        },
        extOptions, // options that will be forwarded to commands from context
        argsWithoutOptions, // remaining arguments with no associated options
        extraArguments, // arguments after the ended argument list (--)
    };
    /* eslint-enable object-property-newline */
}
