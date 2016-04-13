import chalk from 'chalk';
import { isPlainObject, isBoolean, isString, set, difference, isFunction, isRegExp } from 'lodash';
import trimNewlines from 'trim-newlines';
import redent from 'redent';

import { merge } from '../configuration';
import keyboardDistance from './keyboard-distance';
import buildDocumentationObject, { sortOnProperty } from '../documentation/build-documentation-object';
import generateTable from '../documentation/generate-table';
import { getDefaultValue } from '../documentation/helpers';
import { fileExists, getRocPackageDependencies, getRocPluginDependencies, getPackageJson } from '../helpers';
import onProperty from '../helpers/on-property';
import { isValid, throwError } from '../validation';
import { warning, infoLabel, errorLabel, warningLabel, feedbackMessage } from '../helpers/style';
import { toArray, toRegExp } from '../converters';
import { registerAction } from '../hooks/actions';
import getSuggestions from '../helpers/get-suggestions';

import buildExtensionTree from './extensions';

/**
 * Builds the complete configuration objects.
 *
 * @param {boolean} [verbose=true] - If verbose mode should be enabled, logs some extra information.
 * @param {rocConfig} newConfig - The new configuration to base the merge on.
 * @param {rocMetaConfig} newMeta - The new meta configuration to base the merge on.
 * @param {rocConfig} baseConfig - The base configuration.
 * @param {rocMetaConfig} baseMeta - The base meta configuration.
 * @param {string} [directory=process.cwd()] - The directory to resolve relative paths from.
 * @param {boolean} [validate=true] - If the newConfig and the newMeta structure should be validated.
 * @param {boolean} [checkDependencies=true] - If dependencies should be verified in extensions.
 *
 * @returns {Object} - The result of with the built configurations.
 * @property {rocConfig} packageConfig - The packages merged configurations.
 * @property {rocConfig} config - The final configuration, with application configuration.
 * @property {rocMetaConfig} meta - The merged meta configuration.
 */
export function buildCompleteConfig(
    verbose = false, newConfig = {}, newMeta = {}, baseConfig = {},
    baseMeta = {}, directory = process.cwd(), validate = true, checkDependencies = true
) {
    let finalConfig = { ...baseConfig };
    let finalMeta = { ...baseMeta };

    if (fileExists('package.json', directory)) {
        const packageJson = getPackageJson(directory);

        const packages = newConfig.packages && newConfig.packages.length ?
            newConfig.packages :
            getRocPackageDependencies(packageJson);

        const plugins = newConfig.plugins && newConfig.plugins.length ?
            newConfig.plugins :
            getRocPluginDependencies(packageJson);

        const {
            projectExtensions,
            config,
            meta
        } = buildExtensionTree(packages, plugins, baseConfig, baseMeta, directory, verbose, checkDependencies);
        finalConfig = merge(finalConfig, config);
        finalMeta = merge(finalMeta, meta);

        if (projectExtensions.length && verbose) {
            console.log(feedbackMessage(
                infoLabel('Info', 'Extensions Used'),
                projectExtensions.map((extn) => `${extn.name}${extn.version ? ' - ' + extn.version : ''}`).join('\n')
            ));
        }

        // Check for a mismatch between application configuration and packages.
        if (validate) {
            if (Object.keys(newConfig).length) {
                const validationFeedback = validateConfigurationStructure(finalConfig, newConfig);
                if (validationFeedback) {
                    console.log(validationFeedback);
                }
            }

            if (Object.keys(newMeta).length) {
                const validationFeedback = validateConfigurationStructure(finalMeta, newMeta);
                if (validationFeedback) {
                    console.log(validationFeedback);
                }
            }
        }

        // Add project action
        if (isFunction(newConfig.action)) {
            // TODO Update how action is used
            registerAction(newConfig.action, 'default', packageJson.name, true);
        }
    }

    return {
        packageConfig: finalConfig,
        config: merge(finalConfig, newConfig),
        meta: merge(finalMeta, newMeta)
    };
}

function validateConfigurationStructure(config, applicationConfig) {
    const getKeys = (obj, oldPath = '', allKeys = []) => {
        Object.keys(obj).forEach((key) => {
            const value = obj[key];
            const newPath = oldPath + key;

            if (isPlainObject(value)) {
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
        info.push(feedbackMessage(
            warningLabel('Warning', 'Configuration'),
            'There was a mismatch in the application configuration structure, make sure this is correct.\n' +
            getSuggestions(diff, keys)
        ));
    }
    // }
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
    commandsMeta = commandsMeta || { };

    // We will sort the commands
    let body = [{
        name: 'Commands',
        level: 0,
        objects: Object.keys(commands || noCommands).sort().map((command) => {
            const options = commandsMeta[command] ?
                getCommandArgumentsAsString(commandsMeta[command]) :
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

/**
 * Generates arguments as a information string.
 *
 * @param {rocCommandMeta} command - The command meta object.
 * @returns {string} - The arguments as a string.
 */
export function getCommandArgumentsAsString(command = {}) {
    let args = '';
    (command.arguments || []).forEach((argument) => {
        args += argument.required ? ` <${argument.name}> ` : ` [${argument.name}]`;
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
    rows.push('Usage: ' + name + ' ' + command + getCommandArgumentsAsString(commands[command]));
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
        const objects = commands[command].arguments.map((argument) => (
            {
                cli: `${argument.name}`,
                description: createDescription(argument)
            }
        ));

        if (objects.length > 0) {
            body = body.concat({
                objects,
                name: 'Arguments',
                level: 0
            });
        }
    }

    // Generate the options table
    if (commands[command] && commands[command].options) {
        const objects = commands[command].options.sort(onProperty('name')).map((option) => (
            {
                cli: option.shortname ? `-${option.shortname}, --${option.name}` : `--${option.name}`,
                description: createDescription(option)
            }
        ));

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

function createDescription(param) {
    return `${param.description && param.description + '  ' || ''}` +
        `${param.required && chalk.green('Required') + '  ' || ''}` +
        `${param.default && chalk.cyan(JSON.stringify(param.default)) + '  ' || ''}` +
        `${!param.default && param.validation ? chalk.dim('(' + param.validation(null, true).type + ')') : ''}`;
}

function generateCommandDocsHelper(body, header, options, name) {
    body.push({
        name: options,
        level: 0,
        objects: getDefaultOptions(name)
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
 * Gets and array with the default options for the cli.
 * Will be formatted to work with {@link generateTable}
 *
 * @param {string} name - What property the option/flag name should be set.
 *
 * @returns {Object[]} - Array with the default options formatted for {@link generateTable}.
 */
export function getDefaultOptions(name) {
    return [{
        [name]: '-c, --config',
        description: `Path to configuration file, will default to ${chalk.bold('roc.config.js')} in current ` +
            `working directory.`
    }, {
        [name]: '-d, --directory',
        description: 'Path to working directory, will default to the current working directory. Can be either ' +
            'absolute or relative.'
    }, {
        [name]: '-h, --help',
        description: 'Output usage information.'
    }, {
        [name]: '-V, --verbose',
        description: 'Enable verbose mode.'
    }, {
        [name]: '-v, --version',
        description: 'Output version number.'
    }];
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
export function parseArguments(command, commands = {}, args) {
    // If the command supports options
    if (commands[command] && commands[command].arguments) {
        let parsedArguments = {};
        commands[command].arguments.forEach((argument, index) => {
            let value = args[index];

            if (value === undefined && argument.default) {
                value = argument.default;
            }

            if (value === undefined && argument.required) {
                console.log(feedbackMessage(
                    errorLabel('Error', 'Arguments Problem'),
                    `Required argument ${chalk.bold(argument.name)} was not provided.`
                ));
                /* eslint-disable no-process-exit */
                process.exit(1);
                /* eslint-enable */
            }

            if (value !== undefined && argument.converter) {
                value = argument.converter(value);
            }

            if (value !== undefined && argument.validation) {
                const validationResult = isValid(value, argument.validation);
                if (validationResult !== true) {
                    try {
                        throwError(argument.name, validationResult, value, 'argument');
                    } catch (err) {
                        console.log(feedbackMessage(
                            errorLabel('Error', 'Arguments Problem'),
                            'An argument was not valid.\n\n' +
                            err.message
                        ));
                        /* eslint-disable no-process-exit */
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
        arguments: {},
        rest: args
    };
}

/**
 * Creates mappings between cli commands to their "path" in the configuration structure, their validator and type
 * converter.
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
                    converter: getConverter(element.defaultValue, element.cli),
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
function getConverter(value, name) {
    if (isBoolean(value)) {
        return (input) => {
            if (isBoolean(input)) {
                return input;
            }
            if (input === 'true' || input === 'false') {
                return input === 'true';
            }

            console.log(feedbackMessage(
                warningLabel('Warning', 'Conversion Failed'),
                `Invalid value given for ${chalk.bold(name)}. Will use the default ${chalk.bold(value)}.`
            ));

            return value;
        };
    } else if (isRegExp(value)) {
        return (input) => toRegExp(input);
    } else if (Array.isArray(value)) {
        return toArray;
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
 * @param {string} command - The command to parse arguments for.
 * @param {Object} commands - commands from {@link rocMetaConfig}.
 *
 * @returns {{settings: rocConfigSettings, parseOptions: Object}} - The mapped Roc configuration settings object.
 */
export function parseOptions(options, mappings, command, commands = {}) {
    const infoSettings = [];

    const { settings, notManaged } = parseSettingsOptions(options, mappings);

    const {
        possibleCommandOptions,
        possibleCommandOptionsShort,
        infoOptions,
        parsedOptions,
        finalNotManaged
    } = parseCommandOptions(commands[command], notManaged);

    const defaultOptions = ['help', 'config', 'verbose', 'directory', 'version'];
    const defaultOptionsShort = ['h', 'c', 'V', 'd', 'v'];

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
        console.log(feedbackMessage(
            warningLabel('Warning', 'Option Problem'),
            'Some options were not understood.\n\n' +
            infoSettings.join('\n')
        ));
    }

    if (infoOptions.length > 0) {
        console.log(feedbackMessage(
            errorLabel('Error', 'Command Options Problem'),
            'Some command options were not provided.\n\n' +
            infoSettings.join('\n')
        ));
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

            if (value === undefined && option.default) {
                value = option.default;
            }

            // The option is required but no value was found
            if (value === undefined && option.required) {
                const getOptions = () => {
                    const shortOption = option.shortname ? ' or ' + chalk.bold('-' + option.shortname) : '';
                    return chalk.bold('--' + option.name) + shortOption;
                };

                infoOptions.push(`Required option ${getOptions()} was not provided.`);
            }

            if (value !== undefined && option.converter) {
                value = option.converter(value);
            }

            // If we have a value and a validator
            if (value !== undefined && option.validation) {
                const validationResult = isValid(value, option.validation);
                if (validationResult !== true) {
                    try {
                        throwError(getName(name), validationResult, value, 'option');
                    } catch (err) {
                        console.log(feedbackMessage(
                            errorLabel('Error', 'Command Options Problem'),
                            'A option was not valid..\n\n' +
                            err.message
                        ));
                        /* eslint-disable no-process-exit */
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
    const val = mapping.converter(value);
    const validationResult = isValid(val, mapping.validator);
    if (validationResult === true) {
        return val;
    }

    // Make sure that we got something from the conversion.
    const message = val !== undefined && val !== null && val.toString().length > 0 ?
        `Received ${chalk.underline(JSON.stringify(value)) } and it was converted to ` +
            `${chalk.underline(JSON.stringify(val))}. ` :
        '';

    console.log(feedbackMessage(
        warningLabel('Warning', 'Conversion Problem'),
        `There was a problem when trying to automatically convert ${chalk.bold(mapping.name)}. This ` +
        `value will be ignored.\n\n` +
        message + validationResult
    ));
}
