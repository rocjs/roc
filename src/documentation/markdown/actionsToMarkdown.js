import redent from 'redent';
import trimNewlines from 'trim-newlines';

import onProperty from '../../helpers/onProperty';

import createStatefulAnchor from './helpers/createStatefulAnchor';

function createHookName(name, action) {
    return name || `Generic${action.name && ' (' + action.name + ')'}`;
}

/**
 * Function used to generate markdown documentation for all the registered actions.
 * Can be piped to a file and uploaded somewhere easily.
 *
 * @param {string} name - Name from info object in {@link rocCommandObject}.
 * @param {Object[]} actions - The actions from {@link rocCommandObject}.
 *
 * @returns {string} - Markdown documentation.
 */
export default function actionsToMarkdown(name, actions = [], mode, project) {
    // Remove project actions if we are not in project mode
    if (!project) {
        actions = actions.filter((extensionActions) => !extensionActions.project);
    }

    const rows = [];

    // Header
    rows.push('# Actions for `' + name + '`', '');

    if (actions.length === 0) {
        rows.push('__No actions available.__');
        return rows.join('\n');
    }

    rows.push('## Actions');

    const statefulAnchor = createStatefulAnchor(mode);

    actions.forEach((extension) => {
        const sortedActions = extension.actions.sort(onProperty('hook'));
        rows.push(`* ${statefulAnchor(extension.name)}`);
        sortedActions.forEach(({ hook, action }) => {
            rows.push(`  * ${statefulAnchor(createHookName(hook, action))}`);
        });
    });

    rows.push('');

    actions.forEach((extension) => {
        rows.push(`## ${extension.name}`);

        rows.push('');

        const sortedActions = extension.actions.sort(onProperty('hook'));

        sortedActions.forEach((currentAction) => {
            rows.push(`### ${createHookName(currentAction.hook, currentAction.action)}`);

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
