import { isFunction, isString, isPlainObject } from 'lodash';
import { bold } from 'chalk';
import { generateCommandsDocumentation } from './helpers';

// The property "command" is special and can not be used as a command
export function isCommandGroup(commandsObject) {
    return (potentialGroup) =>
        potentialGroup !== '__meta' &&
        isPlainObject(commandsObject[potentialGroup]) &&
        commandsObject[potentialGroup].command === undefined;
}

// The property "command" is special and can not be used as a command
export function isCommand(commandsObject) {
    return (potentialCommmand) =>
        potentialCommmand !== '__meta' &&
        (
            isString(commandsObject[potentialCommmand]) ||
            isFunction(commandsObject[potentialCommmand])
        ) || (
            isPlainObject(commandsObject[potentialCommmand]) &&
            commandsObject[potentialCommmand].command !== undefined
        );
}

export function checkGroup(commands = {}, potentialGroup, args, name, parents = []) {
    if (isCommandGroup(commands)(potentialGroup)) {
        const newGroupOrCommand = args.shift();

        if (!newGroupOrCommand) {
            return console.log(generateCommandsDocumentation(
                commands[potentialGroup],
                name,
                parents.concat(potentialGroup)
            ));
        }

        return checkGroup(
            commands[potentialGroup],
            newGroupOrCommand,
            args,
            name,
            parents.concat(potentialGroup)
        );
    }
    return {
        commands,
        command: potentialGroup,
        parents
    };
}

function getCommands(commands, parents, mappings = {}) {
    let collisions = {};
    let copyMappings = { ...mappings };
    Object.keys(commands)
        .filter((command) => !isCommandGroup(commands)(command))
        .forEach((command) => {
            if (mappings[command]) {
                collisions = {
                    ...collisions,
                    [command]: (collisions[command] || [mappings[command].parents]).concat([parents])
                };
            } else {
                copyMappings = {
                    ...copyMappings,
                    [command]: {
                        commands,
                        parents
                    }
                };
            }
        });

    return {
        mappings: copyMappings,
        collisions
    };
}

function generateAliasesHelper(commands, parents = [],
    previous = getCommands(commands, parents)) {
    return Object.keys(commands)
        .filter(isCommandGroup(commands))
        .map((group) => {
            previous = generateAliasesHelper(
                commands[group],
                parents.concat(group),
                getCommands(commands[group], parents.concat(group), previous.mappings)
            );

            return previous;
        })
        .reduce((previousValue, current) => {
            return {
                collisions: {
                    ...previousValue.collisions,
                    ...current.collisions
                },
                mappings: {
                    ...previousValue.mappings,
                    ...current.mappings
                }
            };
        }, previous);
}

export function generateAliases(commands = {}, command, parents) {
    const { mappings, collisions } = generateAliasesHelper(commands, parents);

    if (collisions[command]) {
        console.log(
            'There was multiple commands in the current scope named the same thing, please limit the scope.', '\n'
        );
        console.log(collisions[command].map((parent) => ` ${parent.concat(bold(command)).join(' ')}`).join('\n'), '\n');
        return undefined;
    }

    if (mappings[command]) {
        return {
            ...mappings[command],
            mappings: Object.keys(mappings)
        };
    }

    return {
        mappings: Object.keys(mappings)
    };
}
