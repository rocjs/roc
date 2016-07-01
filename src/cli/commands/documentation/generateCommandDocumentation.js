import { yellow, cyan, green, dim } from 'chalk';
import redent from 'redent';
import trimNewlines from 'trim-newlines';

import getCommandArgumentsAsString from '../getCommandArgumentsAsString';
import onProperty from '../../../helpers/onProperty';
import buildDocumentationObject, { sortOnProperty } from '../../../documentation/buildDocumentationObject';
import getDefaultValue from '../../../documentation/helpers/getDefaultValue';

import createTable from './createTable';

/**
* Generates a string with information about a specific command.
*
* @param {object} settings - Settings from @{link rocConfig}.
* @param {object} metaSettings - Meta settings from @{link rocMetaConfig}.
* @param {object} metaCommands - Meta commands from @{link rocMetaConfig}.
* @param {string} command - The selected command.
* @param {string} name - The name of the cli.
* @param {string[]} parents - The parents that the command has.
*
* @returns {string} - A string with documentation based on the selected commands.
*/
export default function generateCommandDocumentation(settings, metaSettings, metaCommands, command, name, parents) {
    const rows = [];
    rows.push('Usage: ' + name + ' ' + parents.concat(command).join(' ') +
    getCommandArgumentsAsString(metaCommands[command]));
    rows.push('');

    if (metaCommands[command] && (metaCommands[command].description || metaCommands[command].help)) {
        if (metaCommands[command].help) {
            rows.push(redent(trimNewlines(metaCommands[command].help)));
        } else {
            rows.push(metaCommands[command].description);
        }

        rows.push('');
    }

    let body = [];

    // Generate the arguments table
    if (metaCommands[command] && metaCommands[command].arguments) {
        const objects = metaCommands[command].arguments.map((argument) => (
            {
                cli: `${argument.name}`,
                description: createDescription(argument)
            }
        ));

        if (objects.length > 0) {
            body = body.concat({
                objects,
                name: 'Arguments',
                level: 0
            });
        }
    }

    // Generate the options table
    if (metaCommands[command] && metaCommands[command].options) {
        const objects = metaCommands[command].options.sort(onProperty('name')).map((option) => (
            {
                cli: option.shortname ? `-${option.shortname}, --${option.name}` : `--${option.name}`,
                description: createDescription(option)
            }
        ));

        if (objects.length > 0) {
            body = body.concat({
                name: 'Command options',
                level: 0,
                objects: objects
            });
        }
    }

    // Generate the settings table
    if (metaCommands[command] && metaCommands[command].settings) {
        const filter = metaCommands[command].settings === true ? [] : metaCommands[command].settings;

        body = body.concat({
            name: 'Settings options',
            children: sortOnProperty('name', buildDocumentationObject(settings, metaSettings, filter))
        });
    }

    const header = {
        cli: true,
        description: {
            padding: false
        },
        defaultValue: {
            padding: false,
            renderer: (input) => {
                if (input === undefined) {
                    return '';
                }

                input = getDefaultValue(input);

                if (!input) {
                    return yellow('No default value');
                }

                return cyan(input);
            }
        },
        required: {
            padding: false,
            renderer: (input, object) => {
                if (input && object.defaultValue === undefined) {
                    return green('Required');
                }

                return '';
            }
        },
        notEmpty: {
            padding: false,
            renderer: (input) => {
                if (input) {
                    return yellow('Can not be empty');
                }

                return '';
            }
        }
    };

    rows.push(createTable(body, header, 'General options', 'cli'));

    return rows.join('\n');
}

function createDescription(param) {
    const required = param.validator ? param.validator(null, true).required : false;
    return `${param.description && param.description + '  ' || ''}` +
        `${required && green('Required') + '  ' || ''}` +
        `${param.default !== undefined && cyan(JSON.stringify(param.default)) + '  ' || ''}` +
        `${param.default === undefined && param.validator ?
            dim('(' + param.validator(null, true).type + ')') :
            ''
        }`;
}
