import { isPlainObject } from 'lodash';
import { bold } from 'chalk';
import { generateCommandsDocumentation } from './helpers';

export function isCommandGroup(commandsObject) {
    return (potentialGroup) => isPlainObject(commandsObject[potentialGroup]);
}

export function checkGroup(commands = {}, metaCommands, potentialGroup, args, name, parents = []) {
    if (isCommandGroup(commands)(potentialGroup)) {
        const newGroupOrCommand = args.shift();

        if (!newGroupOrCommand) {
            return console.log(generateCommandsDocumentation(
                commands[potentialGroup],
                metaCommands[potentialGroup],
                name,
                parents.concat(potentialGroup)
            ));
        }

        return checkGroup(
            commands[potentialGroup],
            metaCommands[potentialGroup],
            newGroupOrCommand,
            args,
            name,
            parents.concat(potentialGroup)
        );
    }
    return {
        commands,
        metaCommands,
        command: potentialGroup,
        parents
    };
}

function getCommands(commands, metaCommands, parents, mappings = {}) {
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
                        metaCommands,
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

function generateAliasesHelper(commands, metaCommands, parents = [],
    previous = getCommands(commands, metaCommands, parents)) {
    return Object.keys(commands)
        .filter(isCommandGroup(commands))
        .map((group) => {
            previous = generateAliasesHelper(
                commands[group],
                metaCommands[group],
                parents.concat(group),
                getCommands(commands[group], metaCommands[group], parents.concat(group), previous.mappings)
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

export function generateAliases(commands = {}, metaCommands, command, parents) {
    const { mappings, collisions } = generateAliasesHelper(commands, metaCommands, parents);

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
