import { isPlainObject } from 'lodash';

// The property "command" is special and can not be used as a command
export default function isCommandGroup(commandsObject) {
    return (potentialGroup) =>
        potentialGroup !== '__meta' &&
        isPlainObject(commandsObject[potentialGroup]) &&
        commandsObject[potentialGroup].command === undefined;
}
