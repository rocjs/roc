import getInfoObject from '../../validation/helpers/getInfoObject';
import objectToArray from '../../helpers/objectToArray';

/**
 * Generates arguments as an information string.
 */
export default function getCommandArgumentsAsString(command = {}) {
    let args = '';
    objectToArray(command.arguments).forEach((argument) => {
        const required = getInfoObject(argument.validator).required;
        args += required ? ` <${argument.name}>` : ` [${argument.name}]`;
    });

    return args;
}
