import redent from 'redent';
import stripAnsi from 'strip-ansi';
import trimNewlines from 'trim-newlines';

import generateTable from '../generateTable';
import pad from '../helpers/pad';
import createInfoObject from '../../validation/helpers/createInfoObject';

import createStatefulAnchor from './helpers/createStatefulAnchor';

/**
 * Command used to generate markdown documentation for all the registered hooks.
 * Can be piped to a file and uploaded somewhere easily.
 *
 * @param {string} name - Name from info object in {@link rocCommandObject}.
 * @param {Object} hooks - The hooks from {@link rocCommandObject}.
 *
 * @returns {string} - Markdown documentation.
 */
export default function hooksToMarkdown(name, hooks = {}, mode) {
    const rows = [];

    rows.push(`# Hooks for \`${name}\``, '');

    if (Object.keys(hooks).length === 0) {
        rows.push('__No hooks available.__', '');
        return rows.join('\n');
    }

    const extensions = Object.keys(hooks).sort();

    rows.push('## Hooks');

    const statefulAnchor = createStatefulAnchor(mode);

    extensions.forEach((extension) => {
        const extensionHooks = Object.keys(hooks[extension]).sort();
        rows.push(`* ${statefulAnchor(extension)}`);
        extensionHooks.forEach((hook) => {
            rows.push(`  * ${statefulAnchor(hook)}`);
        });
    });

    rows.push('');

    extensions.forEach((extension) => {
        rows.push(`## ${extension}`);

        rows.push('');

        const extensionHooks = Object.keys(hooks[extension]).sort();

        extensionHooks.forEach((hook) => {
            const currentHook = hooks[extension][hook];

            rows.push(`### ${hook}`);

            if (currentHook.description) {
                rows.push('', redent(trimNewlines(currentHook.description)));
            }

            rows.push('');

            // eslint-disable-next-line
            rows.push('__Initial value:__ ' +
                (currentHook.initialValue ?
                    `\`${JSON.stringify(currentHook.initialValue)}\`` :
                    '_Nothing_')
                + '  '
            );

            // eslint-disable-next-line
            rows.push('__Expected return value:__ ' +
                (currentHook.returns ?
                    `\`${currentHook.returns(null, true).type}\`` :
                    '_Nothing_')
            );

            rows.push('');

            // Create table with arguments
            let body = [];

            // Generate the arguments
            if (currentHook.arguments) {
                const objects = currentHook.arguments.map((argument) => {
                    const infoObject = argument.validator ? argument.validator(null, true) : createInfoObject();
                    return {
                        name: argument.name,
                        description: argument.description || '',
                        type: infoObject.type,
                        required: infoObject.required,
                        canBeEmpty: infoObject.canBeEmpty,
                    };
                });

                if (objects.length > 0) {
                    body = body.concat({
                        name: 'Arguments',
                        level: 1,
                        objects,
                    });
                }
            }

            const header = {
                name: {
                    name: 'Name',
                },
                description: {
                    name: 'Description',
                    renderer: (input) => stripAnsi(input),
                },
                type: {
                    name: 'Type',
                    renderer: (input) => input && `\`${input}\``,
                },
                required: {
                    name: 'Required',
                    renderer: (input) => {
                        if (input === true) {
                            return 'Yes';
                        }
                        return 'No';
                    },
                },
                canBeEmpty: {
                    name: 'Can be empty',
                    renderer: (input) => {
                        if (input === true) {
                            return 'Yes';
                        } else if (input === false) {
                            return 'No';
                        }

                        return '';
                    },
                },
            };

            const settings = {
                groupTitleWrapper: (groupName, level) => `${pad(level + 3, '#')} ${
                    groupName.charAt(0).toUpperCase() + groupName.slice(1)
                }`,
            };
            const table = generateTable(body, header, settings);
            if (table) {
                rows.push(table);
            }
        });
    });

    return rows.join('\n');
}
