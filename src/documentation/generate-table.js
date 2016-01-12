import 'source-map-support/register';

import deepExtend from 'deep-extend';
import { isUndefined } from 'lodash';
import stripAnsi from 'strip-ansi';

import { pad, addPadding } from './helpers';

const defaultSettings = {
    groupTitleWrapper: (name) => name,
    cellDivider: '|',
    rowWrapper: (input) => `|${input}|`,
    cellWrapper: (input) => ` ${input} `,
    header: true,
    compact: false
};

/**
 * Creates a table based on a {@link rocDocumentationObject}.
 *
 * @param {rocDocumentationObject} initalDocumentationObject - The documentation object to create a table of.
 * @param {rocTableHeader} header - Header object to use.
 * @param {rocTableSettings} settings - The settings to use.
 *
 * @returns {string} - A table.
 */
export default function generateTable(initalDocumentationObject, header, settings) {
    settings = deepExtend({}, defaultSettings, settings);
    const headerLengths = createLengthObject(header, header, {}, true);
    const lengths = createLengthObject(initalDocumentationObject, header, headerLengths);

    const printTableCell = (key, element, renderer = (input) => input || '', fill = false) => {
        if (fill) {
            return settings.cellWrapper(pad(lengths[key], '-'));
        }
        const padding = isUndefined(header[key].padding) ? true : header[key].padding;
        const text = padding ?
            addPadding(renderer(element), lengths[key]) :
            renderer(element);

        return settings.cellWrapper(text);
    };

    const printTableRow = (object, isHeader = false) => {
        return settings.rowWrapper(Object.keys(header).map((key) => {
            const { value, renderer } = getValueAndRenderer(isHeader, header[key], object[key]);

            return printTableCell(key, value, renderer);
        }).join(settings.cellDivider));
    };

    const printTableSplitter = () => {
        return settings.rowWrapper(Object.keys(header).map((key) =>
            printTableCell(key, undefined, undefined, true)
        ).join(settings.cellDivider));
    };

    const printTableHead = (name, description, level = 0) => {
        const rows = [];
        rows.push(settings.groupTitleWrapper(name, level));

        if (description) {
            rows.push(description);
        }

        // Add a new empty row
        rows.push('');

        if (settings.header) {
            rows.push(printTableRow(header, true));
            rows.push(printTableSplitter());
        }

        return rows;
    };

    const recursiveHelper = (documentationObject = []) => {
        const spacing = settings.compact ? [] : [''];

        return documentationObject.map((group) => {
            let rows = [];
            const level = group.level || 0;

            if (level === 0 || !settings.compact) {
                rows = rows.concat(printTableHead(group.name, group.description, level));
            }

            rows = rows.concat(group.objects.map((element) =>
                printTableRow(element)));

            rows = rows.concat(recursiveHelper(group.children));

            if (level === 0 && settings.compact) {
                rows.push('');
            }

            return rows;
        }).reduce((a, b) => a.concat(b), spacing);
    };

    return recursiveHelper(initalDocumentationObject).join('\n');
}

function createLengthObject(initalElements, header, initalLengths, isHeader = false) {
    const getObjectLength = (object, renderer = (input) => input) => {
        return stripAnsi(renderer(object)).length;
    };

    const getLength = (newLength, currentLength = 0) => {
        return newLength > currentLength ? newLength : currentLength;
    };

    const recursiveHelper = (elements = [], lengths = {}) => {
        let newLengths = { ...lengths };
        elements.forEach((element) => {
            element.objects.forEach((object) => {
                Object.keys(header).forEach((key) => {
                    const { value, renderer } = getValueAndRenderer(isHeader, header[key], object[key]);
                    if (value) {
                        newLengths[key] = getLength(getObjectLength(value, renderer), newLengths[key]);
                    }
                });
            });

            newLengths = recursiveHelper(element.children, newLengths);
        });

        return newLengths;
    };

    // Make sure the data matches the expected format
    if (!Array.isArray(initalElements)) {
        initalElements = [{objects: [initalElements], children: []}];
    }

    return recursiveHelper(initalElements, initalLengths);
}

function getValueAndRenderer(isHeader, headerObject, object) {
    const value = isHeader ? object.name : object;
    const renderer = isHeader ? (input) => input : headerObject.renderer;

    return {
        value,
        renderer
    };
}
