import 'source-map-support/register';

import chalk from 'chalk';
import { isPlainObject, isBoolean, isString, set, difference } from 'lodash';
import resolve from 'resolve';
import leven from 'leven';
import trimNewlines from 'trim-newlines';
import redent from 'redent';

import { merge } from '../configuration';
import keyboardDistance from './keyboard-distance';
import buildDocumentationObject, { sortOnProperty } from '../documentation/build-documentation-object';
import generateTable from '../documentation/generate-table';
import { getDefaultValue } from '../documentation/helpers';
import { fileExists, getRocDependencies, getPackageJson } from '../helpers';
import { throwError } from '../validation';
import { isValid } from '../validation';
import { warning, importantLabel, errorLabel, warningLabel } from '../helpers/style';

/**
 * Builds the complete configuration objects.
 *
 * @param {boolean} debug - If debug mode should be enabled, logs some extra information.
 * @param {rocConfig} config - The base configuration.
 * @param {rocMetaConfig} meta - The base meta configuration.
 * @param {rocConfig} newConfig - The new configuration to base the merge on.
 * @param {rocMetaConfig} newMeta - The new meta configuration to base the merge on.
 * @param {string} [directory=process.cwd()] - The directory to resolve relative paths from.
 * @param {boolean} [validate=true] - If the newConfig and the newMeta structure should be validated.
 *
 * @returns {Object} - The result of with the built configurations.
 * @property {rocConfig} extensionConfig - The extensions merged configurations
 * @property {rocConfig} config - The final configuration, with application configuration.
 * @property {rocMetaConfig} meta - The merged meta configuration.
 */
export function buildCompleteConfig(
    debug, config = {}, meta = {}, newConfig = {}, newMeta = {}, directory = process.cwd(), validate = true
) {
    let finalConfig = { ...config };
    let finalMeta = { ...meta };

    let usedExtensions = [];
    const mergeExtension = (extensionName) => {
        const { baseConfig, metaConfig = {} } = getExtension(extensionName, directory);

        if (baseConfig) {
            usedExtensions.push(extensionName);
            finalConfig = merge(finalConfig, baseConfig);
            finalMeta = merge(finalMeta, metaConfig);
        }
    };

    if (fileExists('package.json', directory)) {
        // If extensions are defined we will use them to merge the configurations
        if (newConfig.extensions && newConfig.extensions.length) {
            newConfig.extensions.forEach(mergeExtension);
        } else {
            const packageJson = getPackageJson(directory);
            getRocDependencies(packageJson)
                .forEach(mergeExtension);
        }

        if (usedExtensions.length && debug) {
            console.log(importantLabel('The following Roc extensions will be used:'), usedExtensions);
        }

        // Check for a mismatch between application configuration and extensions.
        if (validate) {
            if (Object.keys(newConfig).length) {
                console.log(validateConfigurationStructure(finalConfig, newConfig));
            }
            if (Object.keys(newMeta).length) {
                console.log(validateConfigurationStructure(finalMeta, newMeta));
            }
        }
    }

    return {
        extensionConfig: finalConfig,
        config: merge(finalConfig, newConfig),
        meta: merge(finalMeta, newMeta)
    };
}

function getExtension(extensionName, directory) {
    try {
        const { baseConfig, metaConfig } = require(resolve.sync(extensionName, { basedir: directory }));
        return { baseConfig, metaConfig };
    } catch (err) {
        console.log(
            errorLabel(
                'Failed to load Roc extension ' + chalk.bold(extensionName) + '. ' +
                'Make sure you have it installed. Try running:'
            ) + ' ' +
            chalk.underline('npm install --save ' + extensionName)
        , '\n');
        return {};
    }
}

function validateConfigurationStructure(config, applicationConfig) {
    const getKeys = (obj, oldPath = '', allKeys = []) => {
        Object.keys(obj).forEach((key) => {
            const value = obj[key];
            const newPath = oldPath + key;

            // Handle plugins special since we can't predict how they will look.
            // For example plugins.createBuilder can be an object with new keys or it might not be it.
            if (isPlainObject(value) && oldPath !== 'plugins.') {
                getKeys(value, newPath + '.', allKeys);
            } else {
                allKeys.push(newPath);
            }
        });

        return allKeys;
    };
    const info = [];
    const keys = getKeys(config);
    const diff = difference(getKeys(applicationConfig), keys);
    if (diff.length > 0) {
        info.push(errorLabel('Configuration problem') +
            ' There was a mismatch in the application configuration structure, make sure this is correct.\n');
        info.push(getSuggestions(diff, keys));
        info.push('');
    }
    // }
    return info.join('\n');
}

/**
 * Will create a string with suggestions for possible typos.
 *
 * @param {string[]} current - The current values that might be incorrect.
 * @param {string[]} possible - All the possible correct values.
 * @param {string} [prefix=''] - Something that the suggestion should be prefixed with. Useful for CLI options.
 *
 * @returns {string} - A string with possible suggestions for typos.
 */
export function getSuggestions(current, possible, prefix = '') {
    const info = [];

    current.forEach((currentKey) => {
        let shortest = 0;
        let closest;

        for (let key of possible) {
            let distance = leven(currentKey, key);

            if (distance <= 0 || distance > 4) {
                continue;
            }

            if (shortest && distance >= shortest) {
                continue;
            }

            closest = key;
            shortest = distance;
        }

        if (closest) {
            info.push('Did not understand ' + chalk.underline(prefix + currentKey) +
                ' - Did you mean ' + chalk.underline(prefix + closest));
        } else {
            info.push('Did not understand ' + chalk.underline(prefix + currentKey));
        }
    });

    return info.join('\n');
}

/**
 * Generates a string with information about all the possible commands.
 *
 * @param {rocConfig} commands - The Roc config object, uses commands from it.
 * @param {rocMetaConfig} commandsmeta - The Roc meta config object, uses commands from it.
 *
 * @returns {string} - A string with documentation based on the available commands.
 */
export function generateCommandsDocumentation({ commands }, { commands: commandsMeta }) {
    const header = {
        name: true,
        description: true
    };

    const noCommands = {'No commands available.': ''};
    commandsMeta = commandsMeta || {};

    let body = [{
        name: 'Commands',
        level: 0,
        objects: Object.keys(commands || noCommands).map((command) => {
            const options = commandsMeta[command] ?
                ' ' + getCommandArgumentsAsString(commandsMeta[command]) :
                '';
            const description = commandsMeta[command] && commandsMeta[command].description ?
                commandsMeta[command].description :
                '';

            return {
                name: (command + options),
                description
            };
        })
    }];

    return generateCommandDocsHelper(body, header, 'General options', 'name');
}

function getCommandArgumentsAsString(command = {}) {
    let args = '';
    (command.arguments || []).forEach((argument) => {
        args += argument.required ? `<${argument.name}> ` : `[${argument.name}] `;
    });

    return args;
}

 /**
  * Generates a string with information about a specific command.
  *
  * @param {rocConfig} settings - The Roc config object, uses settings from it.
  * @param {rocMetaConfig} commands+meta - The Roc meta config object, uses commands and settings from it.
  * @param {string} command - The selected command.
  * @param {string} name - The name of the cli.
  *
  * @returns {string} - A string with documentation based on the selected commands.
  */
export function generateCommandDocumentation({ settings }, { commands = {}, settings: meta }, command, name) {
    const rows = [];
    rows.push('Usage: ' + name + ' ' + command + ' ' + getCommandArgumentsAsString(commands[command]));
    rows.push('');

    if (commands[command] && (commands[command].description || commands[command].help)) {
        if (commands[command].help) {
            rows.push(redent(trimNewlines(commands[command].help)));
        } else {
            rows.push(commands[command].description);
        }

        rows.push('');
    }

    let body = [];

    // Generate the arguments table
    if (commands[command] && commands[command].arguments) {
        const objects = commands[command].arguments.map((argument) => {
            return {
                cli: `${argument.name}`,
                description: `${argument.description && argument.description + '  ' || ''}` +
                    `${argument.required && chalk.green('Required') + '  ' || ''}` +
                    `${argument.validation ? chalk.dim('(' + argument.validation(null, true).type + ')') : ''}`
            };
        });

        if (objects.length > 0) {
            body = body.concat({
                name: 'Arguments',
                level: 0,
                objects: objects
            });
        }
    }

    // Generate the options table
    if (commands[command] && commands[command].options) {
        const objects = commands[command].options.map((option) => {
            return {
                cli: option.shortname ? `-${option.shortname}, --${option.name}` : `--${option.name}`,
                description: `${option.description && option.description + '  ' || ''}` +
                    `${option.required && chalk.green('Required') + '  ' || ''}` +
                    `${option.validation ? chalk.dim('(' + option.validation(null, true).type + ')') : ''}`
            };
        });

        if (objects.length > 0) {
            body = body.concat({
                name: 'Command options',
                level: 0,
                objects: objects
            });
        }
    }

    // Generate the settings table
    if (commands[command] && commands[command].settings) {
        const filter = commands[command].settings === true ? [] : commands[command].settings;

        body = body.concat({
            name: 'Settings options',
            children: sortOnProperty('name', buildDocumentationObject(settings, meta, filter))
        });
    }

    const header = {
        cli: true,
        description: {
            padding: false
        },
        defaultValue: {
            padding: false,
            renderer: (input) => {
                input = getDefaultValue(input);

                if (input === undefined) {
                    return '';
                }

                if (!input) {
                    return warning('No default value');
                }

                return chalk.cyan(input);
            }
        },
        required: {
            padding: false,
            renderer: (input, object) => {
                if (input && !object.defaultValue) {
                    return chalk.green('Required');
                }

                return '';
            }
        }
    };

    rows.push(generateCommandDocsHelper(body, header, 'General options', 'cli'));

    return rows.join('\n');
}

function generateCommandDocsHelper(body, header, options, name) {
    body.push({
        name: options,
        level: 0,
        objects: [{
            [name]: '-h, --help',
            description: 'Output usage information.'
        }, {
            [name]: '-v, --version',
            description: 'Output version number.'
        }, {
            [name]: '-d, --debug',
            description: 'Enable debug mode.'
        }, {
            [name]: '-c, --config',
            description: `Path to configuration file, will default to ${chalk.bold('roc.config.js')} in current ` +
                `working directory.`
        }, {
            [name]: '-D, --directory',
            description: 'Path to working directory, will default to the current working directory. Can be either ' +
                'absolute or relative.'
        }]
    });

    return generateTable(body, header, {
        compact: true,
        titleWrapper: (input) => input + ':',
        cellDivider: '',
        rowWrapper: (input) => `${input}`,
        header: false,
        groupTitleWrapper: (input) => input + ':'
    });
}

/**
 * Parses arguments and validates them.
 *
 * @param {string} command - The command to parse arguments for.
 * @param {Object} commands - commands from {@link rocMetaConfig}.
 * @param {Object[]} args - Arguments parsed by minimist.
 *
 * @returns {Object} - Parsed arguments.
 * @property {object[]} options - The parsed arguments that was matched against the meta configuration for the command.
 * @property {object[]} rest - The rest of the arguments that could not be matched against the configuration.
 */
export function parseArguments(command, commands, args) {
    // If the command supports options
    if (commands[command] && commands[command].arguments) {
        let parsedArguments = {};
        commands[command].arguments.forEach((argument, index) => {
            const value = args[index];

            if (argument.required && !value) {
                /* eslint-disable no-process-exit */
                console.log(errorLabel('Arguments problem') +
                    ` Required argument ${chalk.bold(argument.name)} was not provided.\n`);
                process.exit(1);
                /* eslint-enable */
            }

            if (value && argument.validation) {
                const validationResult = isValid(value, argument.validation);
                if (validationResult !== true) {
                    try {
                        throwError(argument.name, validationResult, value, 'argument');
                    } catch (err) {
                        /* eslint-disable no-process-exit */
                        console.log(errorLabel('Arguments problem') + ' An argument was not valid.\n');
                        console.log(err.message);
                        process.exit(1);
                        /* eslint-enable */
                    }
                }
            }

            parsedArguments[argument.name] = value;
        });

        return {
            arguments: parsedArguments,
            rest: args.splice(Object.keys(parsedArguments).length)
        };
    }

    return {
        arguments: undefined,
        rest: args
    };
}

/**
 * Creates mappings between cli commands to their "path" in the configuration structure, their validator and type
 * convertor.
 *
 * @param {rocDocumentationObject} documentationObject - Documentation object to create mappings for.
 *
 * @returns {Object} - Properties are the cli command without leading dashes that maps to a {@link rocMapObject}.
 */
export function getMappings(documentationObject = []) {
    const recursiveHelper = (groups) => {
        let mappings = {};

        groups.forEach((group) => {
            group.objects.forEach((element) => {
                // Remove the two dashes in the beginning to match correctly
                mappings[element.cli.substr(2)] = {
                    name: element.cli,
                    path: element.path,
                    convertor: getConvertor(element.defaultValue, element.cli),
                    validator: element.validator
                };
            });

            mappings = Object.assign({}, mappings, recursiveHelper(group.children));
        });

        return mappings;
    };

    return recursiveHelper(documentationObject);
}

// Convert values based on their default value
function getConvertor(value, name) {
    if (isBoolean(value)) {
        return (input) => {
            if (isBoolean(input)) {
                return input;
            }
            if (input === 'true' || input === 'false') {
                return input === 'true';
            }

            console.log(
                warningLabel(`Invalid value given for ${chalk.bold(name)}.`),
                `Will use the default ${chalk.bold(value)}.`
            );

            return value;
        };
    } else if (Array.isArray(value)) {
        return (input) => {
            let parsed;
            try {
                parsed = JSON.parse(input);
            } catch (err) {
                // Ignore this case
            }

            if (Array.isArray(parsed)) {
                return parsed;
            }

            return input.toString().split(',');
        };
    } else if (Number.isInteger(value)) {
        return (input) => parseInt(input, 10);
    } else if (!isString(value) && (!value || Object.keys(value).length === 0)) {
        return (input) => JSON.parse(input);
    }

    return (input) => input;
}

/**
 * Converts a set of options to {@link rocConfigSettings} object and command specific options.
 *
 * @param {Object} options - Options parsed from minimist.
 * @param {Object} mappings - Result from {@link getMappings}.
 * @param {Object} command - A command.
 *
 * @returns {{settings: rocConfigSettings, parseOptions: Object}} - The mapped Roc configuration settings object.
 */
export function parseOptions(options, mappings, command) {
    const infoSettings = [];

    const { settings, notManaged } = parseSettingsOptions(options, mappings);

    const {
        possibleCommandOptions,
        possibleCommandOptionsShort,
        infoOptions,
        parsedOptions,
        finalNotManaged
    } = parseCommandOptions(command, notManaged);

    const defaultOptions = ['help', 'config', 'debug', 'directory', 'version'];
    const defaultOptionsShort = ['h', 'd', 'c', 'D', 'v'];

    Object.keys(finalNotManaged).forEach((key) => {
        if (key.length > 1) {
            infoSettings.push(getSuggestions([key],
                Object.keys(mappings).concat(defaultOptions, possibleCommandOptions), '--'));
        } else {
            infoSettings.push(getSuggestions([key],
                [keyboardDistance(key, defaultOptionsShort.concat(possibleCommandOptionsShort))], '-'));
        }
    });

    if (infoSettings.length > 0) {
        console.log(errorLabel('Option problem'), 'Some options were not understood.\n');
        console.log(infoSettings.join('\n') + '\n');
    }

    if (infoOptions.length > 0) {
        console.log(errorLabel('Command options problem'), 'Some command options were not provided.\n');
        console.log(infoOptions.join('\n') + '\n');
        /* eslint-disable no-process-exit */
        process.exit(1);
        /* eslint-enable */
    }

    return {
        settings,
        parsedOptions
    };
}

function parseSettingsOptions(options, mappings) {
    const settings = {};
    let notManaged = {};

    Object.keys(options).forEach((key) => {
        if (mappings[key]) {
            const value = convert(options[key], mappings[key]);
            set(settings, mappings[key].path, value);
        } else {
            // We did not find a match
            notManaged = {
                ...notManaged,
                [key]: options[key]
            };
        }
    });

    return {
        settings,
        notManaged
    };
}

function parseCommandOptions(command, notManaged) {
    const infoOptions = [];
    let possibleCommandOptions = [];
    let possibleCommandOptionsShort = [];
    const parsedOptions = {
        options: {},
        rest: {}
    };

    const getName = (name) => name.length === 1 ? '-' + name : '--' + name;

    if (command && command.options) {
        possibleCommandOptions = command.options.map((option) => option.name);
        possibleCommandOptionsShort = command.options.reduce((previous, option) => {
            if (option.shortname) {
                return previous.concat(option.shortname);
            }

            return previous;
        }, []);

        command.options.forEach((option) => {
            let value;
            let name;

            // See if we can match the option against anything.
            if (notManaged[option.name]) {
                value = notManaged[option.name];
                delete notManaged[option.name];
                name = option.name;
            } else if (notManaged[option.shortname]) {
                value = notManaged[option.shortname];
                delete notManaged[option.shortname];
                name = option.shortname;
            }

            // The option is required but no value was found
            if (option.required && !value) {
                const getOptions = () => {
                    const shortOption = option.shortname ? ' or ' + chalk.bold('-' + option.shortname) : '';
                    return chalk.bold('--' + option.name) + shortOption;
                };

                infoOptions.push(`Required option ${getOptions()} was not provided.`);
            }

            // If we have a value and a validator
            if (value && option.validation) {
                const validationResult = isValid(value, option.validation);
                if (validationResult !== true) {
                    try {
                        throwError(getName(name), validationResult, value, 'option');
                    } catch (err) {
                        /* eslint-disable no-process-exit */
                        console.log(errorLabel('Command options problem') + ' A option was not valid.\n');
                        console.log(err.message);
                        process.exit(1);
                        /* eslint-enable */
                    }
                }
            }

            parsedOptions.options[option.name] = value;
        });
    }

    parsedOptions.rest = notManaged;

    return {
        possibleCommandOptions,
        possibleCommandOptionsShort,
        infoOptions,
        parsedOptions,
        finalNotManaged: notManaged
    };
}

function convert(value, mapping) {
    const val = mapping.convertor(value);
    const validationResult = isValid(val, mapping.validator);
    if (validationResult === true) {
        return val;
    }

    // Make sure that we got something from the conversion.
    const message = val !== undefined && val !== null && val.toString().length > 0 ?
        `Received ${chalk.underline(JSON.stringify(value)) } and it was converted to ` +
            `${chalk.underline(JSON.stringify(val))}. ` :
        '';

    console.log(
        warning(`There was a problem when trying to automatically convert ${chalk.bold(mapping.name)}. This ` +
        `value will be ignored.`)
    );
    console.log(message + validationResult, '\n');
}
