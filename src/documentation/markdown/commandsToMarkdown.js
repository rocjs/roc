import redent from 'redent';
import stripAnsi from 'strip-ansi';
import trimNewlines from 'trim-newlines';

import generateTable from '../generateTable';
import pad from '../helpers/pad';
import getCommandArgumentsAsString from '../../cli/commands/getCommandArgumentsAsString';
import getDefaultOptions from '../../cli/commands/getDefaultOptions';
import onProperty from '../../helpers/onProperty';
import createStatefulAnchor from './helpers/createStatefulAnchor';

import isCommandGroup from '../../cli/commands/helpers/isCommandGroup';
import isCommand from '../../cli/commands/helpers/isCommand';

// Table with default options
const header = {
    name: {
        name: 'Name'
    },
    description: {
        name: 'Description',
        renderer: (input) => stripAnsi(input)
    },
    required: {
        name: 'Required',
        renderer: (input) => {
            if (input === true) {
                return 'Yes';
            }
            return 'No';
        }
    }
};

const settings = {
    groupTitleWrapper: (groupName, level) => pad(level + 3, '#') + ' ' +
        groupName.charAt(0).toUpperCase() + groupName.slice(1)
};

/**
 * Command used to generate markdown documentation for all the possible commands.
 * Can be piped to a file and uploaded somewhere easily.
 *
 * @param {string} name - Name of the cli.
 * @param {rocConfig} config - Roc configuration object.
 * @param {rocMetaConfig} metaConfig - Roc meta configuration object.
 * @param {string} settingsLink - A possible link to the settings documentation.
 * @param {string[]} hideCommands - An array with commands that should not be listed in the documentation.
 *
 * @returns {string} - Markdown documentation.
 */
export default function commandsToMarkdown(name, config, commands, settingsLink, mode, hideCommands = [], cli = 'roc') {
    let rows = [];
    const allSettingGroups = config.settings ?
        Object.keys(config.settings).sort() :
        [];

    const printGroup = (group) => {
        const groupName = settingsLink ?
            `[${group}](${settingsLink}#${group})` :
            group;

        return `* ${groupName}`;
    };

    rows.push('# Commands for `' + name + '`', '');

    if (commands) {
        rows.push('## General Information');
        rows.push('All commands can be called with some additional options as can be seen below.', '');

        rows.push(generateTable([{
            name: 'General options',
            level: 0,
            objects: getDefaultOptions('name')
        }], header, settings));

        rows.push('## Commands');

        const { tableOfContent, content } =
            build(cli, commands, allSettingGroups, printGroup, hideCommands, createStatefulAnchor(mode));

        rows = rows.concat(tableOfContent, '', content, '');
    } else {
        rows.push('__No commands available.__');
    }

    return rows.join('\n');
}

function build(cli, commands, allSettingGroups, printGroup, hideCommands, statefulAnchor, parents = [], level = 0) {
    let tableOfContent = [];
    let content = [];

    Object.keys(commands)
        .filter((element) => hideCommands.indexOf(element) === -1)
        .filter((potentialGroup) => isCommand(commands)(potentialGroup))
        .sort()
        .forEach((command) => {
            const spacing = '  '.repeat(level === 0 ? 0 : level + 1);
            tableOfContent.push(`${spacing}* ${statefulAnchor(command)}`);
            content.push(buildCommand(
                cli,
                command,
                commands[command],
                allSettingGroups,
                printGroup,
                parents,
                level
            ).join('\n'));
        });

    Object.keys(commands)
        .filter((element) => hideCommands.indexOf(element) === -1)
        .filter(isCommandGroup(commands))
        .sort()
        .forEach((group) => {
            const spacing = '  '.repeat(level);
            content.push(buildGroup(
                cli,
                group,
                commands[group],
                allSettingGroups,
                printGroup,
                parents,
                level
            ).join('\n'));
            tableOfContent.push(`${spacing}* [${group}](#${group.replace(':', '')})`);
            const { tableOfContent: newTableOfContent, content: newContent } = build(
                    cli,
                    commands[group],
                    allSettingGroups,
                    printGroup,
                    hideCommands,
                    statefulAnchor,
                    parents.concat(group),
                    level + 1
                );
            content = content.concat(newContent);
            tableOfContent = tableOfContent.concat(newTableOfContent);
        });

    return {
        tableOfContent,
        content
    };
}

function buildGroup(cli, command, commandData, allSettingGroups, printGroup, parents, level) {
    const rows = [];
    rows.push(`##${'#'.repeat(level)} ${command}`);
    if (commandData.__meta && commandData.__meta.name) {
        rows.push(`__${commandData.__meta.name}__`);
        rows.push('');
    }

    rows.push('```\n' + `${cli} ${parents.concat(command).join(' ')} <command>` + '\n```');
    if (commandData.__meta && commandData.__meta.description) {
        rows.push(commandData.__meta.description);
        rows.push('');
    }
    rows.push('');
    return rows;
}

function buildCommand(cli, command, commandData, allSettingGroups, printGroup, parents, level) {
    let rows = [];

    rows.push(`##${'#'.repeat(level)} ${command}`);

    if (commandData.description) {
        rows.push(`__${commandData.description}__`);
    }

    rows.push('');

    rows.push('```\n' +
        `${cli} ${parents.concat(command).join(' ')}${getCommandArgumentsAsString(commandData)}` + '\n```');

    // If we have a markdown property we will use that over help
    if (commandData.markdown) {
        rows.push(redent(trimNewlines(commandData.markdown)));
    } else if (commandData.help) {
        rows.push(redent(trimNewlines(commandData.help)));
    }

    // Create table will Arguments + Command Options
    let body = [];

    // Generate the arguments
    if (commandData.arguments) {
        const objects = commandData.arguments.map((argument) => {
            const infoObject = argument.validator ? argument.validator(null, true) : {};
            return {
                name: argument.name,
                description: argument.description || '',
                type: infoObject.type,
                required: infoObject.required,
                notEmpty: infoObject.notEmpty,
                default: argument.default !== undefined && JSON.stringify(argument.default)
            };
        });

        if (objects.length > 0) {
            body = body.concat({
                name: 'Arguments',
                level,
                objects: objects
            });
        }
    }

    // Generate the options
    if (commandData.options) {
        const objects = commandData.options.sort(onProperty('name')).map((option) => {
            const infoObject = option.validator ? option.validator(null, true) : {};
            return {
                name: option.shortname ? `-${option.shortname}, --${option.name}` : `--${option.name}`,
                description: option.description || '',
                type: infoObject.type,
                required: infoObject.required,
                notEmpty: infoObject.notEmpty,
                default: option.default !== undefined && JSON.stringify(option.default)
            };
        });

        if (objects.length > 0) {
            body = body.concat({
                name: 'Command options',
                level,
                objects: objects
            });
        }
    }

    const newHeader = {
        name: {
            name: 'Name'
        },
        description: {
            name: 'Description',
            renderer: (input) => stripAnsi(input)
        },
        default: {
            name: 'Default',
            renderer: (input) => input && `\`${input}\``
        },
        type: {
            name: 'Type',
            renderer: (input) => input && `\`${input}\``
        },
        required: {
            name: 'Required',
            renderer: (input) => {
                if (input === true) {
                    return 'Yes';
                }
                return 'No';
            }
        },
        notEmpty: {
            name: 'Can be empty',
            renderer: (input) => {
                if (input === false) {
                    return 'Yes';
                }
                return 'No';
            }
        }
    };

    rows.push('');

    const table = generateTable(body, newHeader, {
        groupTitleWrapper: (groupName, level2) => pad(level2 + 3, '#') + ' ' +
            groupName.charAt(0).toUpperCase() + groupName.slice(1)
    });
    if (table) {
        rows.push(table);
    }

    if (commandData.settings) {
        rows.push(`###${'#'.repeat(level)}  Settings options`);
        if (commandData.settings === true) {
            rows.push('_All groups are available._');
            rows = rows.concat(allSettingGroups.sort().map(printGroup));
            rows.push('');
        } else {
            rows = rows.concat(commandData.settings.sort().map(printGroup));
            rows.push('');
        }
    }

    if (commandData.__extensions) {
        rows.push(`###${'#'.repeat(level)}  Defined by extensions`);
        rows.push(commandData.__extensions.join(', '));
        rows.push('');
    }

    return rows;
}
