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

    const printTableCell = (key, element, renderer = (input) => input || '', fill = false, object) => {
        if (fill) {
            return settings.cellWrapper(pad(lengths[key], '-'));
        }
        const padding = isUndefined(header[key].padding) ? true : header[key].padding;
        const text = padding ?
            addPadding(renderer(element, object), lengths[key]) :
            renderer(element, object);

        return settings.cellWrapper(text);
    };

    const printTableRow = (object, isHeader = false) => {
        return settings.rowWrapper(Object.keys(header).map((key) => {
            const { value, renderer } = getValueAndRenderer(isHeader, header[key], object[key]);

            return printTableCell(key, value, renderer, undefined, object);
        }).join(settings.cellDivider));
    };

    const printTableSplitter = () => {
        return settings.rowWrapper(Object.keys(header).map((key) =>
            printTableCell(key, undefined, undefined, true)
        ).join(settings.cellDivider));
    };

    const printTableHead = (name, parentNames, description, level = 0, printTableHeader = true) => {
        const rows = [];
        rows.push(settings.groupTitleWrapper(name, level, parentNames));

        if (description) {
            rows.push(description);
        }

        if (settings.header && printTableHeader) {
            // Add a new empty row
            rows.push('');
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
            const objects = group.objects || [];

            if (level === 0 || !settings.compact) {
                rows = rows.concat(
                    printTableHead(group.name, group.parentNames, group.description, level, objects.length > 0)
                );
            }

            rows = rows.concat(objects.map((element) =>
                printTableRow(element)));

            rows = rows.concat(recursiveHelper(group.children));

            if (group.level !== undefined && level === 0 && settings.compact) {
                rows.push('');
            }

            return rows;
        }).reduce((a, b) => a.concat(b), spacing);
    };

    return recursiveHelper(initalDocumentationObject).join('\n');
}

function createLengthObject(initalElements, header, initalLengths, isHeader = false) {
    const getObjectLength = (element, renderer = (input) => input, object) => {
        return stripAnsi(renderer(element, object)).length;
    };

    const getLength = (newLength, currentLength = 0) => {
        return newLength > currentLength ? newLength : currentLength;
    };

    const recursiveHelper = (elements = [], lengths = {}) => {
        let newLengths = { ...lengths };
        elements.forEach((element) => {
            const objects = element.objects || [];
            objects.forEach((object) => {
                Object.keys(header).forEach((key) => {
                    const { value, renderer } = getValueAndRenderer(isHeader, header[key], object[key]);
                    if (value !== undefined && value !== null) {
                        newLengths[key] = getLength(getObjectLength(value, renderer, object), newLengths[key]);
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
