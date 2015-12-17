import 'source-map-support/register';

import chalk from 'chalk';
import minimist from 'minimist';

import { getAbsolutePath } from '../helpers';
import { validate } from '../validation';
import { merge, appendConfig } from '../configuration';
import buildDocumentationObject from '../documentation/build-documentation-object';
import {
    buildCompleteConfig,
    generateCommandsDocumentation,
    generateCommandDocumentation,
    parseOptions,
    getMappings,
    parseArguments
} from './helpers';

export function runCli(args, info = {version: 'Unknown', name: 'Unknown'},
    initalConfig, initalMeta) {
    const {_, h, help, d, debug, v, version, c, config, D, directory, ...restArgs} = minimist(args.slice(2));

    // The first should be our command if there is one
    const [command, ...options] = _;

    // If version is selected output that and stop
    if (version || v) {
        return console.log(info.version || 'Unknown');
    }

    // Possibe to set a command in debug mode
    const debugEnabled = (debug || d) ? true : false;

    // Get the application configuration path
    const applicationConfigPath = config || c;

    // Get the directory Path
    const directoryPath = getAbsolutePath(directory || D);

    // Build the complete config object
    let { extensionConfig, config: configObject, meta: metaObject } =
        buildCompleteConfig(debugEnabled, initalConfig, initalMeta, applicationConfigPath, directoryPath);

    // If we have no command we will display some help information about all possible commands
    if (!command) {
        // TODO extensionConfig vs configObject
        return console.log(generateCommandsDocumentation(extensionConfig, metaObject));
    }

    // If the command does not exist show error
    if (!extensionConfig.commands || !extensionConfig.commands[command]) {
        return console.log(chalk.red('Invalid command: ' + chalk.bold(command) + '\n'));
    }

    // Show command help information if requested
    if (help || h) {
        // TODO extensionConfig vs configObject
        return console.log(generateCommandDocumentation(extensionConfig, metaObject, command));
    }

    const parsedOptions = parseOptions(command, metaObject.commands, options);

    // Only parse arguments if the command accepts it
    if (metaObject.commands[command] && metaObject.commands[command].settings) {
        // Get config from application!
        const documentationObject = buildDocumentationObject(configObject.settings, metaObject.settings);

        const configuration = parseArguments(restArgs, getMappings(documentationObject));
        configObject = merge(configObject, {
            settings: configuration
        });
    }

    // Validate configuration
    validate(configObject.settings, metaObject.settings);

    // Set the configuration object
    appendConfig(configObject);

    // Run the command
    configObject.commands[command](debugEnabled, configObject, metaObject, extensionConfig, parsedOptions);
}
