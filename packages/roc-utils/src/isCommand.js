import { isPlainObject, isString, isFunction } from 'lodash';

// The property "command" is special and can not be used as a command
export default function isCommand(commandsObject) {
    return (potentialCommmand) =>
        potentialCommmand !== '__meta' && (
        (
            isString(commandsObject[potentialCommmand]) ||
            isFunction(commandsObject[potentialCommmand])
        ) || (
            isPlainObject(commandsObject[potentialCommmand]) &&
            commandsObject[potentialCommmand].command !== undefined
        ));
}
