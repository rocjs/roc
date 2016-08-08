import getDefaultOptions from '../getDefaultOptions';
import generateTable from '../../../documentation/generateTable';

export default function createTable(body, header, options, name, compact = true) {
    body.push({
        name: options,
        level: 0,
        objects: getDefaultOptions(name),
    });

    return generateTable(body, header, {
        compact,
        titleWrapper: (input) => `${input}:`,
        cellDivider: '',
        rowWrapper: (input) => ` ${input}`,
        cellWrapper: (input) => `${input}  `,
        header: false,
        groupTitleWrapper: (input) => `${input}:`,
    });
}
