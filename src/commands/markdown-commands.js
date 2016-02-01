import redent from 'redent';
import stripAnsi from 'strip-ansi';
import trimNewlines from 'trim-newlines';

import generateTable from '../documentation/generate-table';
import { pad } from '../documentation/helpers';
import { getCommandArgumentsAsString, getDefaultOptions } from '../cli/helpers';
import onProperty from '../helpers/on-property';

/**
 * Command used to generate markdown documentation for all the possible commands.
 * Can be piped to a file and uploaded somewhere easily.
 *
 * @param {rocConfig} config - Roc configuration object.
 * @param {rocMetaConfig} metaConfig - Roc meta configuration object.
 * @param {{name: string}} info - Info object in {@link rocCommandObject} containing name of the cli.
 * @param {Object} args - The arguments from parsedArguments in {@link rocCommandObject}
 *
 * @returns {string} - Markdown documentation.
 */
export default function markdownCommands(config, metaConfig, { name }, args) {
    const rows = [];
    const allSettingGroups = config.settings ?
        Object.keys(config.settings).sort() :
        [];

    const printGroup = (group) => {
        const groupName = args['settings-link'] ?
            `[${group}](${args['settings-link']}#${group})` :
            group;
        rows.push(`* ${groupName}`);
    };

    if (config.commands) {
        const commands = Object.keys(config.commands).sort();

        // Header
        rows.push('# Commands for `' + name + '`');

        rows.push('');

        rows.push('## General Information');
        rows.push(redent(trimNewlines(`
            All commands can be called with some additional options as can be seen below.`)));

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

        rows.push(generateTable([{
            name: 'General options',
            level: 0,
            objects: getDefaultOptions('name')
        }], header, settings));

        rows.push('## Commands');
        commands.forEach((command) => {
            rows.push(`* [${command}](#${command})`);
        });

        rows.push('');

        commands.forEach((command) => {
            const commandMeta = metaConfig.commands && metaConfig.commands[command] ?
                metaConfig.commands[command] :
                {};

            rows.push(`## ${command}`);

            if (commandMeta.description) {
                rows.push(`__${commandMeta.description}__`);
            }

            rows.push('');

            rows.push('```\n' + `${name} ${command}${getCommandArgumentsAsString(commandMeta)}` + '\n```');

            // If we have a markdown property we will use that over help
            if (commandMeta.markdown) {
                rows.push(redent(trimNewlines(commandMeta.markdown)));
            } else if (commandMeta.help) {
                rows.push(redent(trimNewlines(commandMeta.help)));
            }

            // Create table will Arguments + Command Options
            let body = [];

            // Generate the arguments
            if (commandMeta.arguments) {
                const objects = commandMeta.arguments.map((argument) => {
                    return {
                        name: argument.name,
                        description: argument.description || '',
                        required: argument.required,
                        type: argument.validation && argument.validation(null, true).type
                    };
                });

                if (objects.length > 0) {
                    body = body.concat({
                        name: 'Arguments',
                        level: 0,
                        objects: objects
                    });
                }
            }

            // Generate the options
            if (commandMeta.options) {
                const objects = commandMeta.options.sort(onProperty('name')).map((option) => {
                    return {
                        name: option.shortname ? `-${option.shortname}, --${option.name}` : `--${option.name}`,
                        description: option.description || '',
                        required: option.required,
                        type: option.validation && option.validation(null, true).type
                    };
                });

                if (objects.length > 0) {
                    body = body.concat({
                        name: 'Command options',
                        level: 0,
                        objects: objects
                    });
                }
            }

            const newHeader = {
                ...header,
                type: {
                    name: 'Type',
                    renderer: (input) => input && `\`${input}\``
                }
            };

            rows.push(generateTable(body, newHeader, settings));

            if (commandMeta.settings) {
                rows.push('### Settings options');

                if (commandMeta.settings === true) {
                    rows.push('_All groups are available._');
                    allSettingGroups.sort().forEach(printGroup);
                } else {
                    commandMeta.settings.sort().forEach(printGroup);
                }

                rows.push('');
            }
        });
    }

    return rows.join('\n');
}
