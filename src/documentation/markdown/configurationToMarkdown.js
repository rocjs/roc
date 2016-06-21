import { isFunction, omit } from 'lodash';

export default function configurationToMarkdown(configuration, metaConfiguration, rocCommandObject) {
    const config = omit(configuration, ['settings', 'actions']);
    const configMeta = omit(metaConfiguration, 'settings');
    const groups = Object.keys(config);

    if (groups.length === 0) {
        return 'No config available.';
    }

    const rows = [];

    rows.push('# Configuration');
    rows.push('Configuration that can be defined, other than settings and actions.');

    groups.forEach((group) => {
        rows.push(`## \`${group}\``);

        if (configMeta[group].description) {
            rows.push(
                isFunction(configMeta[group].description) ?
                    configMeta[group].description(rocCommandObject, config[group]) :
                    configMeta[group].description
            );
        }

        rows.push(`__Extensions__: ${configMeta[group].__extensions.join(', ')}`);
    });

    return rows.join('\n');
}
