/**
 * Generates arguments as a information string.
 *
 * @param {rocCommandMeta} command - The command meta object.
 * @returns {string} - The arguments as a string.
 */
export default function getCommandArgumentsAsString(command = {}) {
    let args = '';
    (command.arguments || []).forEach((argument) => {
        args += argument.required ? ` <${argument.name}>` : ` [${argument.name}]`;
    });

    return args;
}
