import 'source-map-support/register';

import chalk from 'chalk';
import { isPlainObject, isBoolean, isString, set, difference } from 'lodash';
import resolve from 'resolve';
import leven from 'leven';
import trimNewlines from 'trim-newlines';
import redent from 'redent';

import { merge } from '../configuration';
import buildDocumentationObject from '../documentation/build-documentation-object';
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
            console.log(importantLabel('The following Roc extensions will be used:'), usedExtensions, '\n');
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
 * @param {boolean} [command=false] - If the suggestion should be managed as a command.
 *
 * @returns {string} - A string with possible suggestions for typos.
 */
export function getSuggestions(current, possible, command = false) {
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

        const extra = command ? '--' : '';
        if (closest) {
            info.push('Did not understand ' + chalk.underline(extra + currentKey) +
                ' - Did you mean ' + chalk.underline(extra + closest));
        } else {
            info.push('Did not understand ' + chalk.underline(extra + currentKey));
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
        objects: Object.keys(commands || noCommands).map((command) => {
            const options = commandsMeta[command] ?
                ' ' + getCommandOptionsAsString(commandsMeta[command]) :
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

    return generateCommandDocsHelper(body, header, 'Options', 'name');
}

function getCommandOptionsAsString(command = {}) {
    let options = '';
    (command.options || []).forEach((option) => {
        options += option.required ? `<${option.name}> ` : `[${option.name}] `;
    });

    return options;
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
    rows.push('Usage: ' + name + ' ' + command + ' ' + getCommandOptionsAsString(commands[command]));
    rows.push('');

    if (commands[command] && commands[command].help) {
        rows.push(redent(trimNewlines(commands[command].help)));
        rows.push('');
    }

    let body = [];

    // Generate the options table
    if (commands[command] && commands[command].settings) {
        rows.push('Options:');
        rows.push('');

        const filter = commands[command].settings === true ? [] : commands[command].settings;

        body = buildDocumentationObject(settings, meta, filter);
    }

    const header = {
        cli: true,
        description: {
            name: 'Description',
            padding: false
        },
        defaultValue: {
            name: 'Default',
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
        }
    };

    rows.push(generateCommandDocsHelper(body, header, 'CLI options', 'cli'));

    return rows.join('\n');
}

function generateCommandDocsHelper(body, header, options, name) {
    body.push({
        name: options,
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
 * Parses options and validates them.
 *
 * @param {string} command - The command to parse options for.
 * @param {Object} commands - commands from {@link rocMetaConfig}.
 * @param {Object[]} options - Options parsed by minimist.
 *
 * @returns {Object} - Parsed options.
 * @property {object[]} options - The parsed options that was matched against the meta configuration for the command.
 * @property {object[]} rest - The rest of the options that could not be matched against the configuration.
 */
export function parseOptions(command, commands, options) {
    // If the command supports options
    if (commands[command] && commands[command].options) {
        let parsedOptions = {};
        commands[command].options.forEach((option, index) => {
            const value = options[index];

            if (option.required && !value) {
                throw new Error(`Required option "${option.name}" was not provided.`);
            }

            if (value && option.validation) {
                const validationResult = isValid(value, option.validation);
                if (validationResult !== true) {
                    try {
                        throwError(option.name, validationResult, value, 'option');
                    } catch (err) {
                        /* eslint-disable no-process-exit, no-console */
                        console.log(errorLabel('Arguments problem') + ' An option was not valid.\n');
                        console.log(err.message);
                        process.exit(1);
                        /* eslint-enable */
                    }
                }
            }

            parsedOptions[option.name] = value;
        });

        return {
            options: parsedOptions,
            rest: options.splice(Object.keys(parsedOptions).length)
        };
    }

    return {
        options: undefined,
        rest: options
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
export function getMappings(documentationObject) {
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
 * Converts a set of arguments to {@link rocConfigSettings} object.
 *
 * @param {Object} args - Arguments parsed from minimist.
 * @param {Object} mappings - Result from {@link getMappings}.
 *
 * @returns {Object} - The mapped Roc configuration settings object.
 */
export function parseArguments(args, mappings) {
    const config = {};
    const info = [];

    Object.keys(args).forEach((key) => {
        if (mappings[key]) {
            const value = convert(args[key], mappings[key]);
            set(config, mappings[key].path, value);
        } else {
            // We did not find a match
            info.push(getSuggestions([key], Object.keys(mappings), true));
        }
    });

    if (info.length > 0) {
        console.log(errorLabel('CLI problem'), 'Some commands were not understood.\n');
        console.log(info.join('\n') + '\n');
    }

    return config;
}

function convert(value, mapping) {
    const val = mapping.convertor(value);
    const validationResult = isValid(val, mapping.validator);
    if (validationResult === true) {
        return val;
    }

    console.log(
        warning(`There was a problem when trying to automatically convert ${chalk.bold(mapping.name)}. This ` +
        `value will be ignored.`)
    );
    console.log(
        `Received ${chalk.underline(value)} and it was converted to ${chalk.underline(val)}.`, validationResult, '\n'
    );
}
