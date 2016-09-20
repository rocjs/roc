import { bold, underline } from 'chalk';
import { isPlainObject, intersection, get, union } from 'lodash';

import isCommand from '../../../cli/commands/helpers/isCommand';
import isCommandGroup from '../../../cli/commands/helpers/isCommandGroup';
import merge from '../../../helpers/merge';

import buildList from './buildList';

// Updates the command object and validates it
export default function processCommands(name, path, extensionCommands, stateCommands) {
    return validateCommands(
        name,
        normalizeCommands(name, path, extensionCommands, stateCommands),
        stateCommands,
        true
    );
}

// Updated the command object
export function normalizeCommands(name, path, extensionCommands, stateCommands = {}) {
    const normalizeCommandsHelper = (newCommands, existingCommands = {}, oldPath = '') => {
        const localCommands = { ...newCommands };
        Object.keys(localCommands).forEach((command) => {
            const newPath = oldPath + command;

            if (isCommandGroup(existingCommands)(command) || isCommand(existingCommands)(command)) {
                const existingExtensions = (existingCommands[command] || {}).__extensions || [];
                if (!isPlainObject(localCommands[command])) {
                    localCommands[command] = {
                        command: localCommands[command],
                        __extensions: [name],
                        __context: path,
                    };
                } else if (localCommands[command].command) {
                    // If the command has been changed we would like to update the context for it
                    localCommands[command].__context = path;
                }

                localCommands[command].__extensions = union(existingExtensions, [name]);

                // If it was a command group and now is a command
                if (isCommandGroup(existingCommands)(command) && isCommand(localCommands)(command)) {
                    localCommands[command].__extensions = [name];
                    localCommands[command].__context = path;
                }
            } else if (isCommand(localCommands)(command)) {
                if (!isPlainObject(localCommands[command])) {
                    localCommands[command] = {
                        command: localCommands[command],
                    };
                }

                localCommands[command].__extensions = [name];
                localCommands[command].__context = path;
            }

            if (
                isCommandGroup(localCommands)(command) &&
                (!isCommand(existingCommands)(command) || localCommands[command].__meta)
            ) {
                localCommands[command] = normalizeCommandsHelper(
                    localCommands[command], existingCommands[command], `${newPath}.`
                );

                if (!localCommands[command].__extensions) {
                    localCommands[command].__extensions = [name];
                }
            }
        });

        return localCommands;
    };

    return normalizeCommandsHelper(merge({}, extensionCommands), stateCommands);
}

function notInExtensions(extensions, extension) {
    if (Array.isArray(extension)) {
        return !extension.some((e) => extensions.indexOf(e) !== -1);
    }

    return extensions.indexOf(extension) === -1;
}

export function validateCommands(name, extensionCommands, stateCommands, ignoreExtension = false) {
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

                getKeys(value, state[key], isState, `${newPath}.`, allKeys);
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
        const stateExtensions = get(stateCommands, intersect).__extensions;
        const extensionExtensions = get(extensionCommands, intersect).__extensions;

        // If it is a group the override info will be on __meta and if not it will be directly on the object
        const override = (get(extensionCommands, intersect, {}).__meta || {}).override ||
            get(extensionCommands, intersect, {}).override;

        if (
            notInExtensions(stateExtensions, name) &&
            override !== true &&
            notInExtensions(stateExtensions, override) &&
            (ignoreExtension || notInExtensions(stateExtensions, extensionExtensions))
        ) {
            // Fail early, might be more errors after this
            // + This gives a better/more concise error for the project developer
            // + We do not waste computation when we already know there is an error
            // - The extension developer will not know the entire picture, just one of potentially several errors
            const overrideMessage = !override ?
                'No override value was specified, it should probably be one of the extensions above.\n' :
                `The override did not match the possible values, it was: ${override}\n`;
            throw new Error(
                'Tried to update a command that where registered from before without specifying override.\n' + // eslint-disable-line
                `${bold(intersect.replace('.', ' '))} has already been defined by:\n` +
                buildList(stateExtensions) +
                overrideMessage +
                `Contact the developer of ${underline(name)} for help.`
            );
        }
    });

    return extensionCommands;
}
