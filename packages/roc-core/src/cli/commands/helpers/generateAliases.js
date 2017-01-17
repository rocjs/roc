import { bold } from 'chalk';
import isCommandGroup from 'roc-utils/lib/isCommandGroup';
import log from 'roc-logger/default/small';

export default function generateAliases(commands = {}, command, parents) {
    const { mappings, collisions } = generateAliasesHelper(commands, parents);

    if (collisions[command]) {
        log.info(
            'There was multiple commands in the current scope named the same thing, please limit the scope.', '\n',
        );
        log.log(
            collisions[command].map((parent) => `   ${parent.concat(bold(command)).join(' ')}`).join('\n'), '\n',
        );
        return undefined;
    }

    if (mappings[command]) {
        return {
            ...mappings[command],
            mappings: Object.keys(mappings),
        };
    }

    return {
        mappings: Object.keys(mappings),
    };
}

function generateAliasesHelper(commands, parents = [],
    previous = getCommands(commands, parents)) {
    return Object.keys(commands)
        .filter(isCommandGroup(commands))
        .map((group) => {
            // eslint-disable-next-line
            previous = generateAliasesHelper(
                commands[group],
                parents.concat(group),
                getCommands(commands[group], parents.concat(group), previous.mappings),
            );

            return previous;
        })
        .reduce((previousValue, current) => ({
            collisions: {
                ...previousValue.collisions,
                ...current.collisions,
            },
            mappings: {
                ...previousValue.mappings,
                ...current.mappings,
            },
        }), previous);
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
                    [command]: (collisions[command] || [mappings[command].parents]).concat([parents]),
                };
            } else {
                copyMappings = {
                    ...copyMappings,
                    [command]: {
                        commands,
                        parents,
                    },
                };
            }
        });

    return {
        mappings: copyMappings,
        collisions,
    };
}
