export default function dependenciesToMarkdown(name, extension, dependencies) {
    if (Object.keys(dependencies).length === 0) {
        return 'No dependencies available.';
    }

    const rows = [];

    rows.push('# Dependencies for `' + name + '`', '');

    rows.push('The dependencies that are available in the project.');

    rows.push('');

    rows.push('## Exported');

    if (Object.keys(dependencies.exports).length === 0) {
        rows.push('Nothing is exported.');
    } else {
        Object.keys(dependencies.exports).sort().forEach((module) => {
            rows.push(`### [${module}](https://www.npmjs.com/package/${module})`);
            rows.push(`__Version__: ${dependencies.exports[module].version}  `);
            rows.push(`__Extension__: ${dependencies.exports[module].extension}  `);
            if (!extension) {
                rows.push(`__Context__:  ${dependencies.exports[module].context}  `);
            }
            rows.push(`__Custom resolve function__:  ${dependencies.exports[module].resolve ? 'Yes' : 'No'}  `);
            rows.push('');
        });
    }

    rows.push('');

    rows.push('## Uses');

    if (Object.keys(dependencies.uses).length === 0) {
        rows.push('Nothing is listed as used.');
    } else {
        Object.keys(dependencies.uses).sort().forEach((module) => {
            rows.push(`### [${module}](https://www.npmjs.com/package/${module})`);
            rows.push(`__Version__: ${dependencies.uses[module].version}  `);
            rows.push(`__Extension__: ${dependencies.uses[module].extension}  `);
            if (!extension) {
                rows.push(`__Context__: ${dependencies.uses[module].context}  `);
            }
            rows.push('');
        });
    }

    rows.push('');

    rows.push('## Requires');

    if (Object.keys(dependencies.requires).length === 0) {
        rows.push('Nothing is required.');
    } else {
        Object.keys(dependencies.requires).sort().forEach((module) => {
            rows.push(`### [${module}](https://www.npmjs.com/package/${module})`);
            rows.push(`__Version__: ${dependencies.requires[module].version}  `);
            rows.push(`__Extension__: ${dependencies.requires[module].extension}  `);
            if (!extension) {
                rows.push(`__Context__: ${dependencies.requires[module].context}  `);
            }
            rows.push('');
        });
    }

    return rows.join('\n');
}
