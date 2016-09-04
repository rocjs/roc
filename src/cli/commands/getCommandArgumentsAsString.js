import getInfoObject from '../../validation/helpers/getInfoObject';

/**
 * Generates arguments as an information string.
 */
export default function getCommandArgumentsAsString(command = {}) {
    let args = '';
    (command.arguments || []).forEach((argument) => {
        const required = getInfoObject(argument.validator).required;
        args += required ? ` <${argument.name}>` : ` [${argument.name}]`;
    });

    return args;
}
