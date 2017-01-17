import { yellow, cyan, green, dim } from 'chalk';
import redent from 'redent';
import trimNewlines from 'trim-newlines';
import onProperty from 'roc-utils/lib/onProperty';
import getInfoObject from 'roc-validators/lib/helpers/getInfoObject';
import objectToArray from 'roc-utils/lib/objectToArray';

import getCommandArgumentsAsString from '../getCommandArgumentsAsString';
import buildDocumentationObject, { sortOnProperty } from '../../../docs/buildDocumentationObject';
import getDefaultValue from '../../../docs/helpers/getDefaultValue';

import createTable from './createTable';

/**
* Generates a string with information about a specific command.
*/
export default function generateCommandDocumentation(settings, metaSettings, metaCommands, command, name, parents) {
    const rows = [];
    rows.push(`Usage: ${name} ${parents.concat(command).join(' ')}` +
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
        const objects = objectToArray(metaCommands[command].arguments).map((argument) => (
            {
                cli: `${argument.name}`,
                description: createDescription(argument),
            }
        ));

        if (objects.length > 0) {
            body = body.concat({
                objects,
                name: 'Arguments',
                level: 0,
            });
        }
    }

    // Generate the options table
    if (metaCommands[command] && metaCommands[command].options) {
        const objects = objectToArray(metaCommands[command].options).sort(onProperty('name')).map((option) => (
            {
                cli: option.alias ? `-${option.alias}, --${option.name}` : `--${option.name}`,
                description: createDescription(option),
            }
        ));

        if (objects.length > 0) {
            body = body.concat({
                name: 'Command options',
                level: 0,
                objects,
            });
        }
    }

    // Generate the settings table
    if (metaCommands[command] && metaCommands[command].settings) {
        const filter = metaCommands[command].settings === true ? [] : metaCommands[command].settings;

        body = body.concat({
            name: 'Settings options',
            children: sortOnProperty('name', buildDocumentationObject(settings, metaSettings, filter)),
        });
    }

    const header = {
        cli: true,
        description: {
            padding: false,
        },
        defaultValue: {
            padding: false,
            renderer: (input) => {
                if (input === undefined) {
                    return '';
                }

                const defaultValue = getDefaultValue(input);

                if (!defaultValue) {
                    return yellow('No default value');
                }

                return cyan(defaultValue);
            },
        },
        required: {
            padding: false,
            renderer: (input, object) => {
                if (input && object.defaultValue === undefined) {
                    return green('Required');
                }

                return '';
            },
        },
        canBeEmpty: {
            padding: false,
            renderer: (input) => {
                if (input) {
                    return yellow('Can not be empty');
                }

                return '';
            },
        },
    };

    rows.push(createTable(body, header, 'General options', 'cli'));

    return rows.join('\n');
}

function createDescription(param) {
    const infoObject = getInfoObject(param.validator);
    return `${(param.description && param.description + '  ') || ''}` +
        `${(infoObject.required && green('Required') + '  ') || ''}` +
        `${(param.default !== undefined && cyan(JSON.stringify(param.default)) + '  ') || ''}` +
        `${param.default === undefined && infoObject.type ?
            dim('(' + infoObject.type + ')') :
            ''
        }`;
}
