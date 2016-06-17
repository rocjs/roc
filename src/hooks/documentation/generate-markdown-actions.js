import redent from 'redent';
import trimNewlines from 'trim-newlines';

import createStatefulAnchor from '../../helpers/stateful-anchor';

/**
 * Function used to generate markdown documentation for all the registered actions.
 * Can be piped to a file and uploaded somewhere easily.
 *
 * @param {string} name - Name from info object in {@link rocCommandObject}.
 * @param {Object[]} actions - The actions from {@link rocCommandObject}.
 *
 * @returns {string} - Markdown documentation.
 */
export default function genereateMarkdownActions(name, actions = [], mode) {
    // Remove project actions if any
    actions = actions.filter((extensionActions) => !extensionActions.project);

    if (actions.length === 0) {
        return 'No actions available.';
    }

    const rows = [];

    // Header
    rows.push('# Actions for `' + name + '`');

    rows.push('');

    rows.push('## Actions');

    const statefulAnchor = createStatefulAnchor(mode);

    actions.forEach((extension) => {
        const sortedActions = Object.keys(extension.actions).sort();
        rows.push(`* ${statefulAnchor(extension.name)}`);
        sortedActions.forEach((action) => {
            rows.push(`  * ${statefulAnchor(action)}`);
        });
    });

    rows.push('');

    actions.forEach((extension) => {
        rows.push(`## ${extension.name}`);

        rows.push('');

        const sortedActions = Object.keys(extension.actions).sort();

        sortedActions.forEach((action) => {
            const currentAction = extension.actions[action];

            rows.push(`### ${action}`);

            if (currentAction.description) {
                rows.push('', redent(trimNewlines(currentAction.description)));
            }

            rows.push('');

            rows.push('__Connects to extension:__ ' +
                (currentAction.extension ?
                    `\`${currentAction.extension}\`` :
                    'Not specified')
                + '  '
            );

            rows.push('__Connects to hook:__ ' +
                (currentAction.hook ?
                    `\`${currentAction.hook}\`` :
                    'Not specified')
                + '  '
            );

            rows.push('');
        });
    });

    return rows.join('\n');
}
