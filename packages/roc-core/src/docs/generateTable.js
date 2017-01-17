import { isUndefined } from 'lodash';
import stripAnsi from 'strip-ansi';
import merge from 'roc-utils/lib/merge';

import addPadding from './helpers/addPadding';
import pad from './helpers/pad';

/* eslint-disable no-unused-vars */
const defaultSettings = {
    groupTitleWrapper: (name, level, parents) => name,
    cellDivider: '|',
    rowWrapper: (input, level) => `|${input}|`,
    cellWrapper: (input) => ` ${input} `,
    header: true,
    compact: false,
};
/* eslint-enable */

/**
 * Creates a table based on a documentation object.
 *
 * @returns {string} - A formatted table.
 */
export default function generateTable(initalDocumentationObject, header, settings) {
    const finalSettings = merge(defaultSettings, settings);
    const headerLengths = createLengthObject(header, header, {}, true);
    const lengths = createLengthObject(initalDocumentationObject, header, headerLengths);

    const printTableCell = (key, element, renderer = (input) => input || '', fill = false, object) => {
        if (fill) {
            return finalSettings.cellWrapper(pad(lengths[key], '-'));
        }
        const padding = isUndefined(header[key].padding) ? true : header[key].padding;
        const text = padding ?
            addPadding(renderer(element, object), lengths[key]) :
            renderer(element, object);

        return finalSettings.cellWrapper(text);
    };

    const printTableRow = (object, level, isHeader = false) =>
        finalSettings.rowWrapper(Object.keys(header).map((key) => {
            const { value, renderer } = getValueAndRenderer(isHeader, header[key], object[key]);

            return printTableCell(key, value, renderer, undefined, object);
        }).join(finalSettings.cellDivider), level);

    const printTableSplitter = (level) =>
        finalSettings.rowWrapper(Object.keys(header).map(
            (key) => printTableCell(key, undefined, undefined, true),
        ).join(finalSettings.cellDivider), level);

    const printTableHead = ({ name, description, raw }, parentNames, level = 0, printTableHeader = true) => {
        const rows = [];
        rows.push(finalSettings.groupTitleWrapper(name, level, parentNames));

        if (description) {
            rows.push(description, '');
        } else if (finalSettings.header) {
            rows.push('');
        }

        if (raw) {
            rows.push('✓ ― Supports __raw', '');
        }

        if (finalSettings.header && printTableHeader) {
            rows.push(printTableRow(header, level, true));
            rows.push(printTableSplitter(level));
        }

        return rows;
    };

    const recursiveHelper = (documentationObject = [], parentNames, first = false) => {
        const spacing = finalSettings.compact || first ? [] : [''];

        return documentationObject.map((group) => {
            let rows = [];
            const level = group.level || 0;
            const objects = group.objects || [];

            if (level === 0 || !finalSettings.compact) {
                rows = rows.concat(
                    printTableHead(group, parentNames, level, objects.length > 0),
                );
            }

            rows = rows.concat(objects.map((element) =>
                printTableRow(element, level)));

            rows = rows.concat(recursiveHelper(group.children, parentNames.concat(group.name)));

            if (group.level !== undefined && level === 0 && finalSettings.compact) {
                rows.push('');
            }

            return rows;
        }).reduce((a, b) => a.concat(b), spacing);
    };

    return recursiveHelper(initalDocumentationObject, [], true).join('\n');
}

function createLengthObject(initalElements, header, initalLengths, isHeader = false) {
    const getObjectLength = (element, renderer = (input) => input, object) =>
        stripAnsi(renderer(element, object)).length;

    const getLength = (newLength, currentLength = 0) =>
        (newLength > currentLength ? newLength : currentLength);

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
    const elements = !Array.isArray(initalElements) ?
        [{ objects: [initalElements], children: [] }] :
        initalElements;

    return recursiveHelper(elements, initalLengths);
}

function getValueAndRenderer(isHeader, headerObject, object) {
    const value = isHeader ? object.name : object;
    const renderer = isHeader ? (input) => input : headerObject.renderer;

    return {
        value,
        renderer,
    };
}
