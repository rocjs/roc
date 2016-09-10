import { isString } from 'lodash';
import minimist from 'minimist';

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

import checkGroup from './commands/helpers/checkGroup';
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

    // Check if we are in a subgroup
    const result = checkGroup(context.commands, input.groupOrCommand, input.argsWithoutOptions, info.name);
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
        log.large.error(
            getSuggestions([command], suggestions),
            'Invalid command'
        );
    }

    // Show command help information if requested
    // Will ignore application configuration
    if (input.coreOptions.help || input.coreOptions.h) {
        return console.log(generateCommandDocumentation(context.extensionConfig.settings, context.meta.settings,
            commands, command, info.name, parents));
    }


    let documentationObject;
    // Only parse arguments if the command accepts it
    if (commands[command] && commands[command].settings) {
        // Get config from application and only parse options that this command cares about.
        const filter = commands[command].settings === true ? [] : commands[command].settings;
        documentationObject = buildDocumentationObject(context.config.settings, context.meta.settings, filter);
    }

    const { settings, parsedOptions } =
        parseOptions(input.extOptions, getMappings(documentationObject), commands[command]);

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
    runHook('roc')('update-settings', () => getSettings())(
        (newSettings) => appendSettings(newSettings)
    );

    if (invoke) {
        // If string run as shell command
        if (isString(commands[command].command)) {
            return execute(commands[command].command, {
                context: commands[command].__context,
                args: input.extraArguments,
                cwd: input.coreOptions.directory,
            }).catch((error) => {
                process.exitCode = error.getCode ? error.getCode() : 1;
                log.small.error('An error happened when running the Roc command', error);
            });
        }

        const parsedArguments = parseArguments(command, commands, input.argsWithoutOptions);

        // Run the command
        return commands[command].command({
            info,
            arguments: parsedArguments,
            options: parsedOptions,
            extraArguments: input.extraArguments,
            // Roc Context
            context,
        });
    }

    return undefined;
}

/* Return an object wrapping all relevant data from minimist with descriptive names */
function parseCliInput(minimistData) {
    const {
        _,
        h,
        help,
        V,
        verbose,
        v,
        version,
        c,
        config,
        d,
        directory,
        b,
        'better-feedback': betterFeedback,
        '--': extraArguments,
        ...extOptions,
    } = minimistData;

    // The first should be our command or commandgroup, if there is one
    const [groupOrCommand, ...argsWithoutOptions] = _;

    return {
        groupOrCommand, // commandgroup or command
        coreOptions: { // options managed and parsed by core
            h,
            help,
            V,
            verbose,
            v,
            version,
            c,
            config,
            d,
            directory,
            b,
            betterFeedback,
        },
        extOptions, // options that will be forwarded to commands from context
        argsWithoutOptions, // remaining arguments with no associated options
        extraArguments, // arguments after the ended argument list (--)
    };
}
