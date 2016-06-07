import chalk from 'chalk';
import redent from 'redent';
import trimNewlines from 'trim-newlines';
import { isPlainObject, intersection, get, unset, set } from 'lodash';
import { isCommandGroup, isCommand } from '../utils';

export default function manageCommands(name, newCommands, state) {
    return manageCommandCollisions(
        normalizeCommands(name, newCommands, state),
        name,
        state
    );
}

export function normalizeCommands(name, newCommands, existingCommands = {}) {
    const clearCommands = {};

    const normalizeCommandsHelper = (newCommands, existingCommands = {}, name, oldPath = '') => {
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
                    set(clearCommands, newPath, null);
                    localCommands[command].__extensions = [ name ];
                }
            } else {
                if (isCommand(localCommands)(command)) {
                    if (!isPlainObject(localCommands[command])) {
                        localCommands[command] = {
                            command: localCommands[command]
                        };
                    }

                    localCommands[command].__extensions = [ name ];
                }
            }

            if (
                isCommandGroup(localCommands)(command) &&
                (!isCommand(existingCommands)(command) || localCommands[command].__meta)
            ) {
                // If it was a command and now is a command group
                if (isCommand(existingCommands)(command) && localCommands[command].__meta) {
                    set(clearCommands, newPath, null);
                }

                localCommands[command] = normalizeCommandsHelper(
                    localCommands[command], existingCommands[command], name, newPath + '.'
                );

                localCommands[command].__extensions = [ name ];
            }
        });

        return localCommands;
    }

    return {
        clearCommands,
        commands: normalizeCommandsHelper(newCommands, existingCommands, name)
    };
}

function notInExtensions(extensions, extension) {
    return extensions.indexOf(extension) === -1;
}

function manageCommandCollisions({ commands, clearCommands }, name, state) {
    const map = {};

    const once = (command, name, previous) => (
        map[command + name + previous] ?
            false :
            map[command + name + previous] = true
    );

    const getKeys = (obj, state = {}, isState = false, oldPath = '', allKeys = []) => {
        Object.keys(obj).forEach((key) => {
            const value = obj[key];
            const newPath = oldPath + key;

            if (isCommandGroup(state)(key)) {
                if (!isState) {
                    // We have modified the meta data or we have made it into a command
                    if (( obj[key].__meta || obj[key].command )) {
                        allKeys.push(newPath);
                    }
                } else {
                    allKeys.push(newPath);
                }

                getKeys(value, state[key], isState, newPath + '.', allKeys);
            } else if(isCommand(state)(key)) {
                allKeys.push(newPath);
            }
        });

        return allKeys;
    };

    const intersections = intersection(
        getKeys(commands, state, false),
        getKeys(state, state, true)
    );

    intersections.forEach((intersect) => {
        const extensions = get(state, intersect).__extensions;
        const override = ((get(commands, intersect) || {}).__meta || {}).override || (get(commands, intersect) || {}).override;

        if (notInExtensions(extensions, name) && override !== true && notInExtensions(extensions, override)) {
            // FIXME Maybe take the last in the array and not join
            if (once(intersect, name, extensions.join('@@'))) {
                // FIXME Replace with log function
                console.log(chalk.red('Command is registered from before and not overridden and will therefore be ignored!'));
                console.log(redent(trimNewlines(`
                    command: ${chalk.cyan(intersect.replace('.', ' '))}
                    extensions: ${chalk.cyan(extensions)}
                    current: ${chalk.cyan(name)}
                    override: ${chalk.cyan(override)}`
                ), 2), '\n');
            }

            unset(commands, intersect);
            unset(clearCommands, intersect);
        }
    });

    return {
        commands,
        clearCommands
    }
}
