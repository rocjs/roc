import 'source-map-support/register';

import { escape } from 'lodash';

import buildDocumentationObject from '../documentation/build-documentation-object';
import generateTable from '../documentation/generate-table';
import { pad, getDefaultValue } from '../documentation/helpers';
import { error as styleError, warning, ok } from '../helpers/style';

/**
 * Generates markdown documentation for the provided configuration object.
 *
 * @param {rocConfig} config - The configuration object to generate documentation for.
 * @param {rocMetaConfig} metaConfig - The meta configuration object that has information about the config object.
 * @param {string[]} [filter=[]] - The groups that should be includes, by default all will be used.
 *
 * @returns {string} - A markdown table as a string.
 */
export function generateMarkdownDocumentation({ settings }, { settings: meta }, filter = []) {
    const documentationObject = buildDocumentationObject(settings, meta, filter);

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
            name: 'CLI Flag'
        },
        defaultValue: {
            name: 'Default',
            renderer: (input) => input && `\`${getDefaultValue(input)}\``
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
        }
    };

    return generateTable(documentationObject, header, {
        groupTitleWrapper: (name, level) => pad(level + 1, '#') + ' ' + name.charAt(0).toUpperCase() + name.slice(1)
    });
}

/**
 * Generates plain text documentation for the provided configuration object.
 *
 * @param {rocConfig} config - The configuration object to generate documentation for.
 * @param {rocMetaConfig} metaConfig - The meta configuration object that has information about the config object.
 * @param {string[]} [filter=[]] - The groups that should be includes, by default all will be used.
 *
 * @returns {string} - A table as a string.
 */
export function generateTextDocumentation({ settings }, { settings: meta }, filter = []) {
    const documentationObject = buildDocumentationObject(settings, meta, filter);

    const header = {
        description: {
            name: 'Description',
            renderer: (input) => input && input.substr(0, 100) + '…'
        },
        path: {
            name: 'Path'
        },
        defaultValue: {
            name: 'Default',
            renderer: (input) => {
                input = getDefaultValue(input);
                if (!input) {
                    return warning('No default value');
                }
                return input;
            }
        },
        cli: {
            name: 'CLI Flag'
        },
        required: {
            name: 'Required',
            renderer: (input) => {
                if (input === true) {
                    return ok('Yes');
                }
                return styleError('No');
            }
        }
    };

    return generateTable(documentationObject, header);
}
