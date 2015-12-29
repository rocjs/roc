import 'source-map-support/register';

import path from 'path';
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

/**
 * Builds a configuration object.
 *
 * @param {boolean} debug - If debug mode should be enabled, logs some extra information.
 * @param {object} config - The base configuration.
 * @param {object} meta - The base meta configuration.
 * @param {object} newConfig - The new configuration to base the merge on.
 * @param {object} newMeta - The new meta configuration to base the merge on.
 * @param {string} [directory=process.cwd()] - The directory to resolve relative paths from.
 * @param {boolean} [validate=true] - If the newConfig and the newMeta structure should be validated.
 * @returns {object} The result of with the built configurations.
 * @property {extensionConfig} foo this is description.
 * @property {config} bar this is description.
 * @property {meta} baz this is description.
 */
export function buildCompleteConfig(
    debug, config = {}, meta = {}, newConfig = {}, newMeta = {}, directory = process.cwd(), validate = true) {
    let finalConfig = { ...config };
    let finalMeta = { ...meta };

    let usedExtensions = [];
    const mergeExtension = (extensionName) => {
        const { baseConfig, metaConfig } = getExtension(extensionName, directory);

        if (baseConfig && metaConfig) {
            usedExtensions.push(extensionName);
            finalConfig = merge(finalConfig, baseConfig);
            finalMeta = merge(finalMeta, metaConfig);
        }
    };

    // If extensions are defined we will use them to merge the configurations
    if (newConfig.extensions && newConfig.extensions.length) {
        newConfig.extensions.forEach(mergeExtension);
    } else {
        const projectPackageJson = require(path.join(directory, 'package.json'));
        [
            ...Object.keys(projectPackageJson.dependencies || {}),
            ...Object.keys(projectPackageJson.devDependencies || {})
        ]
        .filter(dependecy => /^roc(-.+)/.test(dependecy))
        .forEach(mergeExtension);
    }

    if (usedExtensions.length && debug) {
        console.log('The following Roc extensions will be used:', usedExtensions, '\n');
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
            chalk.bgRed(
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
        info.push(chalk.bgRed('Configuration problem') +
            ' There was a mismatch in the application configuration structure, make sure this is correct.\n');
        info.push(getSuggestions(diff, keys));
        info.push('');
    }
    // }
    return info.join('\n');
}

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

export function generateCommandsDocumentation({ commands }, { commands: commandsMeta }) {
    const header = {
        name: true,
        description: true
    };

    const noCommands = {'No commands available.': ''};
    commandsMeta = commandsMeta || {};

    let table = [{
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
    }, {
        name: 'Options',
        objects: [{
            name: '-h, --help',
            description: 'Output usage information.'
        }, {
            name: '-v, --version',
            description: 'Output version number.'
        }, {
            name: '-d, --debug',
            description: 'Enable debug mode.'
        }, {
            name: '-c, --config',
            description: `Path to configuration file, will default to ${chalk.bold('roc.config.js')} in current ` +
                `working directory.`
        }, {
            name: '-D, --directory',
            description: 'Path to working directory, will default to the current working directory. Can be either ' +
                'absolute or relative.'
        }]
    }];

    return generateTable(table, header, {
        compact: true,
        titleWrapper: (name) => name + ':',
        cellDivider: '',
        rowWrapper: (input) => `${input}`,
        header: false,
        groupTitleWrapper: (input) => input + ':'
    });
}

function getCommandOptionsAsString(command = {}) {
    let options = '';
    (command.options || []).forEach((option) => {
        options += option.required ? `<${option.name}> ` : `[${option.name}] `;
    });

    return options;
}

/**
 * Generates plain text documentation for the provided configuration object
 *
 * Prints the documentation directly to the console.log
 *
 * @param {object} config - the configuration object to generate documentation for
 * @param {object} metaConfig - the meta configuration object that has information about the configuration object
 * @param {string} command - the current command to show information about
 * @param {string} name - the current command line program
 * @returns {string} The documentation as a string.
 */
export function generateCommandDocumentation({ settings }, { commands, settings: meta }, command, name) {
    const rows = [];
    rows.push('Usage: ' + name + ' ' + command + ' ' + getCommandOptionsAsString(commands[command]));
    rows.push('');

    if (commands[command] && commands[command].help) {
        rows.push(redent(trimNewlines(commands[command].help)));
        rows.push('');
    }

    let documentationObject = [];

    // Generate the options table
    if (commands[command] && commands[command].settings) {
        rows.push('Options:');
        rows.push('');

        const filter = commands[command].settings === true ? [] : commands[command].settings;

        documentationObject = buildDocumentationObject(settings, meta, filter);
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
                    return chalk.yellow('No default value');
                }

                return chalk.cyan(input);
            }
        }
    };

    documentationObject.push({
        name: 'CLI options',
        objects: [{
            cli: '-h, --help',
            description: 'Output usage information.'
        }, {
            cli: '-v, --version',
            description: 'Output version number.'
        }, {
            cli: '-d, --debug',
            description: 'Enable debug mode.'
        }, {
            cli: '-c, --config',
            description: `Path to configuration file, will default to ${chalk.bold('roc.config.js')} in current ` +
                `working directory.`
        }, {
            cli: '-D, --directory',
            description: 'Path to working directory, will default to the current working directory. Can be either ' +
                'absolute or relative.'
        }]
    });

    rows.push(generateTable(documentationObject, header, {
        compact: true,
        titleWrapper: (input) => input + ':',
        cellDivider: '',
        rowWrapper: (input) => `${input}`,
        header: false,
        groupTitleWrapper: (input) => input + ':'
    }));

    return rows.join('\n');
}

export function parseOptions(command, meta, options) {
    // If the command supports options
    if (meta[command] && meta[command].options) {
        let parsedArguments = {};
        meta[command].options.forEach((option, index) => {
            const value = options[index];

            if (option.required && !value) {
                throw new Error(`Required option "${option.name}" was not provided.`);
            }

            if (option.validation && !option.validation(value)) {
                throw new Error(`Validation failed for option "${option.name}". `
                    + `Should be ${option.validation(null, true)}.`);
            }

            parsedArguments[option.name] = value;
        });

        return {
            arguments: parsedArguments,
            rest: options.splice(Object.keys(parsedArguments).length)
        };
    }

    return {
        arguments: undefined,
        rest: options
    };
}

export function getMappings(documentationObject) {
    const recursiveHelper = (groups) => {
        let mappings = {};

        groups.forEach((group) => {
            group.objects.forEach((element) => {
                // Remove the two dashes in the beginning to match correctly
                mappings[element.cli.substr(2)] = {
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

            // TODO Do not have console.log here!
            console.log(`Invalid value given for ${chalk.bold(name)}. Will use the default ` +
                `${chalk.bold(value)}.`);

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
        console.log(chalk.bgRed('CLI problem') + ' Some commands was not understood.\n');
        console.log(info.join('\n') + '\n');
    }

    return config;
}

function convert(value, mapping) {
    // Maybe we can let the validation happen later?
    // Should in reallity be managed when we do validation on everything
    const val = mapping.convertor(value);
    if (mapping.validator(val)) {
        return val;
    }
}
