import { isFunction, omit } from 'lodash';

export default function configurationToMarkdown(name, configuration, metaConfiguration, rocCommandObject) {
    const config = omit(configuration, ['settings', 'project']);
    const configMeta = omit(metaConfiguration, 'settings');
    const groups = Object.keys(config);

    const rows = [];

    rows.push(`# Config for \`${name}\``, '');

    rows.push('Configuration that can be defined in `roc.config.js`, other than settings and project.', '');

    if (groups.length === 0) {
        rows.push('__No config available.__');
        return rows.join('\n');
    }

    groups.forEach((group) => {
        rows.push(`## \`${group}\``);

        if (configMeta[group].description) {
            rows.push(
                isFunction(configMeta[group].description) ?
                    configMeta[group].description(rocCommandObject, config[group]) :
                    configMeta[group].description
            , '');
        }

        rows.push(`__Extensions__: ${configMeta[group].__extensions.join(', ')}`);
    });

    return rows.join('\n');
}
