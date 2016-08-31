/**
 * Generates arguments as an information string.
 */
export default function getCommandArgumentsAsString(command = {}) {
    let args = '';
    (command.arguments || []).forEach((argument) => {
        const required = argument.validator ? argument.validator(null, true).required : false;
        args += required ? ` <${argument.name}>` : ` [${argument.name}]`;
    });

    return args;
}
