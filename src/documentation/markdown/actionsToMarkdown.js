import redent from 'redent';
import trimNewlines from 'trim-newlines';

import onProperty from '../../helpers/onProperty';

import createStatefulAnchor from './helpers/createStatefulAnchor';

function createHookName(name, action) {
    return name || `Generic${action.name && ` (${action.name})`}`;
}

export default function actionsToMarkdown(name, actions = [], mode, project) {
    // Remove project actions if we are not in project mode
    const correctedActions = !project ?
        actions.filter((extensionActions) => !extensionActions.project) :
        actions;

    const rows = [];

    // Header
    rows.push(`# Actions for \`${name}\``, '');

    if (correctedActions.length === 0) {
        rows.push('__No actions available.__', '');
        return rows.join('\n');
    }

    rows.push('## Actions');

    const statefulAnchor = createStatefulAnchor(mode);

    correctedActions.forEach((extension) => {
        const sortedActions = extension.actions.sort(onProperty('hook'));
        rows.push(`* ${statefulAnchor(extension.name)}`);
        sortedActions.forEach(({ hook, action }) => {
            rows.push(`  * ${statefulAnchor(createHookName(hook, action))}`);
        });
    });

    rows.push('');

    correctedActions.forEach((extension) => {
        rows.push(`## ${extension.name}`);

        rows.push('');

        const sortedActions = extension.actions.sort(onProperty('hook'));

        sortedActions.forEach((currentAction) => {
            rows.push(`### ${createHookName(currentAction.hook, currentAction.action)}`);

            if (currentAction.description) {
                rows.push('', redent(trimNewlines(currentAction.description)));
            }

            rows.push('');

            // eslint-disable-next-line
            rows.push('__Connects to extension:__ ' +
                (currentAction.extension ?
                    `\`${currentAction.extension}\`` :
                    'Not specified')
                + '  '
            );

            // eslint-disable-next-line
            rows.push('__Connects to hook:__ ' +
                (currentAction.hook ?
                    `\`${currentAction.hook}\`` :
                    'Not specified')
                + '  '
            );

            // eslint-disable-next-line
            rows.push('__Have post:__ ' + (currentAction.post ? 'Yes' : 'No') + '  ');

            rows.push('');
        });
    });

    return rows.join('\n');
}
