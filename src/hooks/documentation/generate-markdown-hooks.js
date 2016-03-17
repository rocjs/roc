import redent from 'redent';
import stripAnsi from 'strip-ansi';
import trimNewlines from 'trim-newlines';

import generateTable from '../../documentation/generate-table';
import { pad } from '../../documentation/helpers';

/**
 * Command used to generate markdown documentation for all the registered hooks.
 * Can be piped to a file and uploaded somewhere easily.
 *
 * @param {string} name - Name from info object in {@link rocCommandObject}.
 * @param {Object} hooks - The hooks from {@link rocCommandObject}.
 *
 * @returns {string} - Markdown documentation.
 */
export default function generateMarkdownHooks(name, hooks) {
    if (Object.keys(hooks).length === 0) {
        return 'No hooks available.';
    }

    const rows = [];

    const extensions = Object.keys(hooks).sort();

    // Header
    rows.push('# Hooks for `' + name + '`');

    rows.push('');

    rows.push('## Hooks');

    extensions.forEach((extension) => {
        const extensionHooks = Object.keys(hooks[extension]).sort();
        rows.push(`* [${extension}](#${extension})`);
        extensionHooks.forEach((hook) => {
            rows.push(`  * [${hook}](#${hook})`);
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

            rows.push('__Initial value:__ ' +
                (currentHook.initialValue ?
                    `\`${JSON.stringify(currentHook.initialValue)}\`` :
                    '_Nothing_')
                + '  '
            );

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
                    return {
                        name: argument.name,
                        description: argument.description || '',
                        type: argument.validation && argument.validation(null, true).type
                    };
                });

                if (objects.length > 0) {
                    body = body.concat({
                        name: 'Arguments',
                        level: 1,
                        objects: objects
                    });
                }
            }

            const header = {
                name: {
                    name: 'Name'
                },
                description: {
                    name: 'Description',
                    renderer: (input) => stripAnsi(input)
                },
                type: {
                    name: 'Type',
                    renderer: (input) => input && `\`${input}\``
                }
            };

            const settings = {
                groupTitleWrapper: (groupName, level) => pad(level + 3, '#') + ' ' +
                    groupName.charAt(0).toUpperCase() + groupName.slice(1)
            };
            const table = generateTable(body, header, settings);
            if (table) {
                rows.push(table);
            }
        });
    });

    return rows.join('\n');
}
