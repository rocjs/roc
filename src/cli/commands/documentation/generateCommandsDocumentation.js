import { isPlainObject } from 'lodash';

import getCommandArgumentsAsString from '../getCommandArgumentsAsString';
import isCommand from '../helpers/isCommand';
import isCommandGroup from '../helpers/isCommandGroup';

import createTable from './createTable';

/**
 * Generates a string with information about all the possible commands.
 */
export default function generateCommandsDocumentation(cmds, name, parents = []) {
    const commands = Object.keys(cmds).length === 0 ?
        { 'No commands available.': '' } :
        cmds;

    const header = {
        name: true,
        description: true,
    };

    let body = [{
        name: 'Commands',
        level: 0,
        objects: getObjects(commands),
    }];

    body = body.concat(getGroups(commands));

    const rows = [];
    rows.push(`Usage: ${name} ${parents.concat('<command>').join(' ')}`, null);

    if (commands.__meta && commands.__meta.description) {
        rows.push(commands.__meta.description, null);
    }

    rows.push(createTable(body, header, 'General options', 'name', false));
    return rows.join('\n');
}

function getGroups(commands, parentNames = [], level = 1) {
    return Object.keys(commands)
        .filter(isCommandGroup(commands))
        .sort()
        .map((group) => ({
            name: commands[group].__meta && commands[group].__meta.name ? commands[group].__meta.name : group,
            level,
            objects: getObjects(commands[group], parentNames.concat(group), level + 1),
            children: getGroups(commands[group], parentNames.concat(group), level + 1),
        }));
}

function getObjects(commands, parentNames = [], level = 1) {
    return Object.keys(commands)
        .filter((command) => isCommand(commands)(command))
        .sort()
        .map((command) => {
            const args = isPlainObject(commands[command]) && commands[command].arguments ?
                getCommandArgumentsAsString(commands[command]) :
                '';
            const description = isPlainObject(commands[command]) && commands[command].description ?
                commands[command].description :
                '';

            return {
                name: (parentNames.concat(command).join(' ') + args),
                level,
                description,
            };
        });
}
