/**
 * Generates arguments as a information string.
 *
 * @param {rocCommandMeta} command - The command meta object.
 * @returns {string} - The arguments as a string.
 */
export default function getCommandArgumentsAsString(command = {}) {
    let args = '';
    (command.arguments || []).forEach((argument) => {
        const required = argument.validator ? argument.validator(null, true).required : false;
        args += required ? ` <${argument.name}>` : ` [${argument.name}]`;
    });

    return args;
}
