/**
 * Writes information about if a type is required and if it can be empty inline
 */
export default function writeInfoInline(type, canBeEmpty, required) {
    const empty = canBeEmpty ? '?' : '';
    return type && `${required ? `<${empty}${type}>` : `[${empty}${type}]`}`;
}
