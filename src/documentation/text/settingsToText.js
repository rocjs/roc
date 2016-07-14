import { green, yellow, red } from 'chalk';

import buildDocumentationObject, { sortOnProperty } from '../buildDocumentationObject';
import generateTable from '../generateTable';
import getDefaultValue from '../helpers/getDefaultValue';

/**
 * Generates plain text documentation for the provided configuration object.
 *
 * @param {rocConfig} config - The configuration object to generate documentation for.
 * @param {rocMetaConfig} metaConfig - The meta configuration object that has information about the config object.
 * @param {string[]} [filter=[]] - The groups that should be includes, by default all will be used.
 *
 * @returns {string} - A table as a string.
 */
export default function settingsToText({ settings }, { settings: meta }, filter = []) {
    const documentationObject = sortOnProperty('name', buildDocumentationObject(settings, meta, filter));

    const header = {
        description: {
            name: 'Description',
            renderer: (input) => {
                if (input && input.length > 100) {
                    return input.substr(0, 100) + '…';
                }

                if (input) {
                    return input;
                }
            }
        },
        path: {
            name: 'Path'
        },
        defaultValue: {
            name: 'Default',
            renderer: (input) => {
                const defaultValue = getDefaultValue(input);
                if (!defaultValue) {
                    return yellow('No default value');
                }
                return defaultValue;
            }
        },
        cli: {
            name: 'CLI option'
        },
        required: {
            name: 'Required',
            renderer: (input) => {
                if (input === true) {
                    return green('Yes');
                }
                return red('No');
            }
        },
        canBeEmpty: {
            name: 'Can be empty',
            renderer: (input) => {
                if (input === true) {
                    return green('Yes');
                } else if (input === false) {
                    return red('No');
                }

                return '';
            }
        }
    };

    const text = generateTable(documentationObject, header, {
        groupTitleWrapper: (name, level, parentNames) => parentNames.concat(name).join(' > ')
    });

    if (text.length === 0) {
        return 'No settings available.';
    }

    return text;
}
