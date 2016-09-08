import log from '../../log/default/large';
import isValid from '../../validation/helpers/isValid';
import getInfoObject from '../../validation/helpers/getInfoObject';
import throwValidationError from '../../validation/helpers/throwValidationError';
import automatic from '../../converters/automatic';
import objectToArray from '../../helpers/objectToArray';

/**
 * Parses arguments and validates them.
 *
 * @param {string} command
 * @param {Object} commands
 * @param {Object[]} args - Arguments parsed by minimist.
 *
 * @returns {Object} - Parsed arguments.
 * @property {Object} managed - The parsed arguments that was matched against the configuration for the command.
 * @property {Object[]} unmanaged - The rest of the arguments that could not be matched against the configuration.
 */
export default function parseArguments(command, commands = {}, args) {
    // If the command supports options
    if (commands[command] && commands[command].arguments) {
        const parsedArguments = {};
        objectToArray(commands[command].arguments).forEach((argument, index) => {
            let value = args[index];

            if (value === undefined && argument.default) {
                value = argument.default;
            }

            const converter =
                argument.converter ||
                getInfoObject(argument.validator).converter ||
                (argument.default !== undefined && automatic(argument.default));

            if (value !== undefined && converter) {
                value = converter(value);
            }

            if (argument.validator) {
                const validationResult = isValid(value, argument.validator);
                if (validationResult !== true) {
                    try {
                        throwValidationError(argument.name, validationResult, value, 'argument');
                    } catch (err) {
                        log.error(
                            'An argument was not valid.\n\n' +
                                err.message,
                            'Arguments Problem'
                        );
                    }
                }
            }

            parsedArguments[argument.name] = value;
        });

        return {
            managed: parsedArguments,
            unmanaged: args.splice(Object.keys(parsedArguments).length),
        };
    }

    return {
        managed: {},
        unmanaged: args,
    };
}
