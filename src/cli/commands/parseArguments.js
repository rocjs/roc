import { bold } from 'chalk';

import log from '../../log/default/large';
import isValid from '../../validation/helpers/isValid';
import throwValidationError from '../../validation/helpers/throwValidationError';

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
export default function parseArguments(command, commands = {}, args) {
    // If the command supports options
    if (commands[command] && commands[command].arguments) {
        let parsedArguments = {};
        commands[command].arguments.forEach((argument, index) => {
            let value = args[index];

            if (value === undefined && argument.default) {
                value = argument.default;
            }

            if (value === undefined && argument.required) {
                log.error(
                    `Required argument ${bold(argument.name)} was not provided.`,
                    'Arguments Problem'
                );
            }

            if (value !== undefined && argument.converter) {
                value = argument.converter(value);
            }

            if (value !== undefined && argument.validation) {
                const validationResult = isValid(value, argument.validation);
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
            arguments: parsedArguments,
            rest: args.splice(Object.keys(parsedArguments).length)
        };
    }

    return {
        arguments: {},
        rest: args
    };
}
