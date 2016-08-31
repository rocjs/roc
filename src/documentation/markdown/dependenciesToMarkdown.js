export default function dependenciesToMarkdown(name, extension, dependencies = {}) {
    const rows = [];

    rows.push(`# Dependencies for \`${name}\``, '');

    if (Object.keys(dependencies).length === 0) {
        rows.push('__No dependencies available.__');
        return rows.join('\n');
    }

    rows.push('The dependencies that are available in the project.');

    rows.push('');

    rows.push('## Exported');

    if (Object.keys(dependencies.exports).length === 0) {
        rows.push('Nothing is exported.', '');
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

    rows.push('## Uses');

    let noUses = true;

    Object.keys(dependencies.uses).sort().forEach((extn) => {
        if (Object.keys(dependencies.uses[extn]).length > 0) {
            rows.push(`### ${extn}`);
            noUses = false;

            Object.keys(dependencies.uses[extn]).sort().forEach((module) => {
                rows.push(`#### [${module}](https://www.npmjs.com/package/${module})`);
                rows.push(`__Version__: ${dependencies.uses[extn][module].version}  `);
                if (!extension) {
                    rows.push(`__Context__: ${dependencies.uses[extn][module].context}  `);
                }
                rows.push('');
            });
        }
    });

    if (noUses) {
        rows.push('Nothing is listed as used.', '');
    }

    return rows.join('\n');
}
