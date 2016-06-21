/**
 * Will take a command string an return an array with the different parts of the command.
 *
 * Will manage command parts that has been grouped with " or '.
 *
 * @param {string} commandString - The string to split up into parts.
 *
 * @returns {string[]} - An array with the different parts of the command.
 */
export default function getParts(commandString) {
    const regex = /[^\s"']+|"([^"]*)"|'([^']*)'/g;
    const parts = [];
    let match;

    while ((match = regex.exec(commandString))) {
        const [generalMatch, doubleQuotationMatch, singleQuotationMatch] = match;
        parts.push(doubleQuotationMatch || singleQuotationMatch || generalMatch);
    }

    return parts;
}
