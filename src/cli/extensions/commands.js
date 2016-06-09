import { bold, underline } from 'chalk';
import { isPlainObject, intersection, get } from 'lodash';
import { isCommandGroup, isCommand } from '../utils';

export default function manageCommands(name, extensionCommands, stateCommands) {
    return manageCommandCollisions(
        name,
        normalizeCommands(name, extensionCommands, stateCommands),
        stateCommands
    );
}

export function normalizeCommands(name, extensionCommands, stateCommands = {}) {
    const normalizeCommandsHelper = (newCommands, existingCommands = {}, oldPath = '') => {
        const localCommands = { ...newCommands };
        Object.keys(localCommands).forEach((command) => {
            const newPath = oldPath + command;

            if (isCommandGroup(existingCommands)(command) || isCommand(existingCommands)(command)) {
                const existingExtensions = (existingCommands[command] || {}).__extensions || [];
                if (!isPlainObject(localCommands[command])) {
                    localCommands[command] = {
                        command: localCommands[command]
                    };
                }
                if (notInExtensions(existingExtensions, name)) {
                    localCommands[command].__extensions = [
                        ...existingExtensions,
                        name
                    ];
                }

                // If it was a command group and now is a command
                if (isCommandGroup(existingCommands)(command) && isCommand(localCommands)(command)) {
                    localCommands[command].__extensions = [ name ];
                }
            } else if (isCommand(localCommands)(command)) {
                if (!isPlainObject(localCommands[command])) {
                    localCommands[command] = {
                        command: localCommands[command]
                    };
                }

                localCommands[command].__extensions = [ name ];
            }

            if (
                isCommandGroup(localCommands)(command) &&
                (!isCommand(existingCommands)(command) || localCommands[command].__meta)
            ) {
                localCommands[command] = normalizeCommandsHelper(
                    localCommands[command], existingCommands[command], newPath + '.'
                );

                localCommands[command].__extensions = [ name ];
            }
        });

        return localCommands;
    };

    return normalizeCommandsHelper(extensionCommands, stateCommands);
}

function notInExtensions(extensions, extension) {
    return extensions.indexOf(extension) === -1;
}

function manageCommandCollisions(name, extensionCommands, stateCommands) {
    const getKeys = (obj, state = {}, isState = false, oldPath = '', allKeys = []) => {
        Object.keys(obj).forEach((key) => {
            const value = obj[key];
            const newPath = oldPath + key;

            if (isCommandGroup(state)(key)) {
                if (!isState) {
                    // We have modified the meta data or we have made it into a command
                    if (obj[key].__meta || obj[key].command) {
                        allKeys.push(newPath);
                    }
                } else {
                    allKeys.push(newPath);
                }

                getKeys(value, state[key], isState, newPath + '.', allKeys);
            } else if (isCommand(state)(key)) {
                allKeys.push(newPath);
            }
        });

        return allKeys;
    };

    const intersections = intersection(
        getKeys(extensionCommands, stateCommands, false),
        getKeys(stateCommands, stateCommands, true)
    );

    intersections.forEach((intersect) => {
        const extensions = get(stateCommands, intersect).__extensions;
        // If it is a group the override info will be on __meta and if not it will be directly on the object
        const override = (get(extensionCommands, intersect, {}).__meta || {}).override ||
            get(extensionCommands, intersect, {}).override;

        if (notInExtensions(extensions, name) && override !== true && notInExtensions(extensions, override)) {
            // Fail early, might be more errors after this
            const overrideMessage = !override ?
                `No override value was specified, it should probably be one of: ${extensions}\n` :
                `The override did not match the possible values, it was: ${override}\n`;
            throw new Error(
                'Tried to update a command that where registered from before without specifying override.\n' +
                `${bold(intersect.replace('.', ' '))} has already been defined by ${extensions}.\n` +
                overrideMessage +
                `Contact the developer of ${underline(name)} for help.`
            );
        }
    });

    return extensionCommands;
}
