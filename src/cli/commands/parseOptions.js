import { bold, underline } from 'chalk';
import { set } from 'lodash';

import isValid from '../../validation/helpers/isValid';
import throwValidationError from '../../validation/helpers/throwValidationError';
import log from '../../log/default/large';
import getSuggestions from '../../helpers/getSuggestions';
import keyboardDistance from '../../helpers/keyboardDistance';

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
export default function parseOptions(options, mappings, command) {
    const infoSettings = [];

    const { settings, notManaged } = parseSettingsOptions(options, mappings);

    const {
        possibleCommandOptions,
        possibleCommandOptionsShort,
        infoOptions,
        parsedOptions,
        finalNotManaged
    } = parseCommandOptions(command, notManaged);

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
        log.warn(
            'Some options were not understood.\n\n' +
                infoSettings.join('\n'),
            'Option Problem'
        );
    }

    if (infoOptions.length > 0) {
        log.error(
            'Some command options were not provided.\n\n' +
                infoSettings.join('\n'),
            'Command Options Problem'
        );
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
                    const shortOption = option.shortname ? ' or ' + bold('-' + option.shortname) : '';
                    return bold('--' + option.name) + shortOption;
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
                        throwValidationError(getName(name), validationResult, value, 'option');
                    } catch (err) {
                        log.error(
                            'A option was not valid.\n\n' +
                                err.message,
                            'Command Options Problem'
                        );
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
        `Received ${underline(JSON.stringify(value)) } and it was converted to ` +
            `${underline(JSON.stringify(val))}. ` :
        '';

    log.warn(
        `There was a problem when trying to automatically convert ${bold(mapping.name)}. This ` +
            `value will be ignored.\n\n` +
            message + validationResult,
        'Conversion Problem'
    );
}