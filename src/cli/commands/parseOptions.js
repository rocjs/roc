import { bold, underline } from 'chalk';
import { set } from 'lodash';

import isValid from '../../validation/helpers/isValid';
import getInfoObject from '../../validation/helpers/getInfoObject';
import throwValidationError from '../../validation/helpers/throwValidationError';
import log from '../../log/default/large';
import getSuggestions from '../../helpers/getSuggestions';
import keyboardDistance from '../../helpers/keyboardDistance';
import automatic from '../../converters/automatic';
import objectToArray from '../../helpers/objectToArray';

import { defaultOptions, defaultOptionsAlias } from './getDefaultOptions';

/**
 * Converts a set of options to {@link rocConfigSettings} object and command specific options.
 *
 * @param {Object} options - Options parsed from minimist.
 * @param {Object} mappings - Result from {@link getMappings}.
 * @param {string} command - The command to parse arguments for.
 *
 * @returns {{settings: rocConfigSettings, parseOptions: Object}} - The mapped Roc configuration settings object.
 */
export default function parseOptions(options, mappings, command) {
    const infoSettings = [];

    const { settings, notManaged } = parseSettingsOptions(options, mappings);

    const {
        possibleCommandOptions,
        possibleCommandOptionsShort,
        parsedOptions,
        finalNotManaged,
    } = parseCommandOptions(command, notManaged);

    Object.keys(finalNotManaged).forEach((key) => {
        if (key.length > 1) {
            infoSettings.push(getSuggestions([key],
                Object.keys(mappings).concat(defaultOptions, possibleCommandOptions), '--'));
        } else {
            infoSettings.push(getSuggestions([key],
                [keyboardDistance(key, defaultOptionsAlias.concat(possibleCommandOptionsShort))], '-'));
        }
    });

    if (infoSettings.length > 0) {
        log.warn(
            'Some options were not understood.\n\n' +
                infoSettings.join('\n'),
            'Option Problem'
        );
    }

    return {
        settings,
        parsedOptions,
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
                [key]: options[key],
            };
        }
    });

    return {
        settings,
        notManaged,
    };
}

/* eslint-disable no-param-reassign */
function parseCommandOptions(command, notManaged) {
    let possibleCommandOptions = [];
    let possibleCommandOptionsShort = [];
    const parsedOptions = {
        managed: {},
        unmanaged: {},
    };

    const getName = (name, option) => {
        if (name) {
            return name.length === 1 ? '-' + name : '--' + name;
        }

        const shortOption = option.alias ? ' / ' + bold('-' + option.alias) : '';
        return '--' + option.name + shortOption;
    };

    if (command && command.options) {
        const options = objectToArray(command.options);

        possibleCommandOptions = options.map((option) => option.name);
        possibleCommandOptionsShort = options.reduce((previous, option) => {
            if (option.alias) {
                return previous.concat(option.alias);
            }

            return previous;
        }, []);

        options.forEach((option) => {
            let value;
            let name;

            // See if we can match the option against anything.
            if (notManaged[option.name] !== undefined) {
                value = notManaged[option.name];
                delete notManaged[option.name];
                name = option.name;
            } else if (notManaged[option.alias] !== undefined) {
                value = notManaged[option.alias];
                delete notManaged[option.alias];
                name = option.alias;
            }

            if (value === undefined && option.default) {
                value = option.default;
            }

            const converter =
                option.converter ||
                getInfoObject(option.validator).converter ||
                (option.default !== undefined && automatic(option.default));

            if (value !== undefined && converter) {
                value = converter(value);
            }

            // If we have a value and a validator
            if (option.validator) {
                const validationResult = isValid(value, option.validator);
                if (validationResult !== true) {
                    try {
                        throwValidationError(getName(name, option), validationResult, value, 'option');
                    } catch (err) {
                        log.error(
                            'A option was not valid.\n\n' +
                                err.message,
                            'Command Options Problem'
                        );
                    }
                }
            }

            parsedOptions.managed[option.name] = value;
        });
    }

    parsedOptions.unmanaged = notManaged;

    return {
        possibleCommandOptions,
        possibleCommandOptionsShort,
        parsedOptions,
        finalNotManaged: notManaged,
    };
}
/* eslint-enable */

function convert(value, mapping) {
    const val = mapping.converter(value);
    const validationResult = isValid(val, mapping.validator);
    if (validationResult === true) {
        return val;
    }

    // Make sure that we got something from the conversion.
    const message = val !== undefined && val !== null && val.toString().length > 0 ?
        `Received ${underline(JSON.stringify(value))} and it was converted to ` +
            `${underline(JSON.stringify(val))}. ` :
        '';

    log.warn(
        `There was a problem when trying to automatically convert ${bold(mapping.name)}. This ` +
            `value will be ignored.\n\n` +
            message + validationResult,
        'Conversion Problem'
    );

    return undefined;
}
