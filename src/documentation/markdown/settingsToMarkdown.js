import { escape } from 'lodash';

import buildDocumentationObject, { sortOnProperty } from '../buildDocumentationObject';
import generateTable from '../generateTable';
import pad from '../helpers/pad';
import getDefaultValue from '../helpers/getDefaultValue';

/**
 * Generates markdown documentation for the provided configuration object.
 *
 * @param {string} name - The name of the one generation the documentation.
 * @param {rocConfig} config - The configuration object to generate documentation for.
 * @param {rocMetaConfig} metaConfig - The meta configuration object that has information about the config object.
 * @param {string[]} [filter=[]] - The groups that should be includes, by default all will be used.
 *
 * @returns {string} - A markdown table as a string.
 */
export default function settingsToMarkdown(name, { settings }, { settings: meta }, filter = []) {
    const documentationObject = sortOnProperty('name', buildDocumentationObject(settings, meta, filter));

    const header = {
        name: {
            name: 'Name'
        },
        description: {
            name: 'Description',
            renderer: (input) => escape(input)
        },
        path: {
            name: 'Path'
        },
        cli: {
            name: 'CLI option'
        },
        defaultValue: {
            name: 'Default',
            renderer: (input) => input !== undefined && `\`${getDefaultValue(input)}\``
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
        },
        extensions: {
            name: 'Extensions',
            renderer: (input) => input.join(', ')
        }
    };

    const text = generateTable(documentationObject, header, {
        groupTitleWrapper: (title, level) => pad(level + 2, '#') + ' ' + title.charAt(0).toUpperCase() + title.slice(1)
    });

    if (text.length === 0) {
        return 'No settings available.';
    }

    return '# Settings for `' + name + '`' + '\n\n' +
        text;
}