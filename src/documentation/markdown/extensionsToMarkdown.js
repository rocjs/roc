import { isFunction } from 'lodash';

export default function extensionsToMarkdown(name, usedExtensions, rocCommandObject, extension) {
    const rows = [];

    const packages = usedExtensions.filter((extn) => extn.type === 'package' &&
        // Do no list the package itself, this is based on the name of the extension and the current name of the
        // project that this commands runs from.
        extn.name !== rocCommandObject.context.packageJSON.name);

    const plugins = usedExtensions.filter((extn) => extn.type === 'plugin' &&
        // Do no list the plugin itself, this is based on the name of the extension and the current name of the
        // project that this commands runs from.
        extn.name !== rocCommandObject.context.packageJSON.name);

    rows.push('# Extensions for `' + name + '`', '');

    rows.push('The extensions that are used in the project, indirect and direct, in the order that they were added.\n');
    rows.push('## Packages');
    if (packages.length > 0) {
        packages.forEach((pkg) => {
            rows.push(`### ${pkg.name} — [v${pkg.version}](https://www.npmjs.com/package/${pkg.name})`);
            const description = isFunction(pkg.description) ?
                pkg.description(rocCommandObject, extension) :
                pkg.description;

            rows.push(description);
            rows.push('');
        });
    } else {
        rows.push('_No packages._', '');
    }

    rows.push('## Plugins');
    if (plugins.length > 0) {
        plugins.forEach((plugin) => {
            rows.push(`### ${plugin.name} — [v${plugin.version}](https://www.npmjs.com/package/${plugin.name})`);
            const description = isFunction(plugin.description) ?
                plugin.description(rocCommandObject, extension) :
                plugin.description;

            rows.push(description);
            rows.push('');
        });
    } else {
        rows.push('_No plugins._', '');
    }

    return rows.join('\n');
}
