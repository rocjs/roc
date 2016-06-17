import { writeFile } from 'fs';
import { join } from 'path';

import { isFunction, omit } from 'lodash';

import generateMarkdownHooks from '../hooks/documentation/generate-markdown-hooks';
import generateMarkdownActions from '../hooks/documentation/generate-markdown-actions';
import generateMarkdownCommands from '../commands/markdown-commands';
import generateMarkdownDependencies from '../cli/extensions/generate-markdown-dependencies';

import { generateMarkdownDocumentation } from './';

const writeFilePromise = (file) => {
    return new Promise((resolve, reject) => {
        writeFile(file.path, file.content, (err) => {
            if (err) {
                return reject(err);
            }

            return resolve();
        });
    });
};

export default function generateDocs({
    rocCommandObject,
    directory = 'docs',
    html = false,
    markdown = true,
    mode,
    extension = false
}) {
    const dir = rocCommandObject.directory;
    const subDir = join(dir, directory);
    const name = rocCommandObject.pkg.name;

    const documentation = [
        {
            content: generateReadme(name, directory, extension, rocCommandObject),
            path: extension ? `${dir}/README.md` : `${dir}/ROC.md`
        }, {
            content: generateMarkdownActions(name, rocCommandObject.actions, mode),
            // /docs || /roc-documentation
            path: `${subDir}/Actions.md`
        }, {
            content: generateMarkdownDependencies(name, rocCommandObject.dependencies),
            path: `${subDir}/Dependencies.md`
        }, {
            content: generateMarkdownHooks(name, rocCommandObject.hooks, mode),
            path: `${subDir}/Hooks.md`
        }, {
            content: generateMarkdownDocumentation(name, rocCommandObject.extensionConfig, rocCommandObject.metaObject),
            path: `${subDir}/Settings.md`
        }, {
            content: generateMarkdownCommands(
                name,
                rocCommandObject.extensionConfig,
                rocCommandObject.commands,
                `${subDir}/Settings.md`,
                mode
            ),
            path: `${subDir}/Commands.md`
        }, {
            content: generateMarkdownConfiguration(
                rocCommandObject.extensionConfig,
                rocCommandObject.metaObject,
                rocCommandObject
            ),
            path: `${subDir}/Configuration.md`
        }, {
            content: generateMarkdownExtensions(
                rocCommandObject.usedExtensions,
                rocCommandObject,
                extension
            ),
            path: `${subDir}/Extensions.md`
        }
    ];

    const documentations = [];
    if (markdown) {
        documentations.push(generateMarkdown(documentation));
    }
    if (html) {
        documentations.push(generateHTML(documentation));
    }

    return Promise.all(documentations);
}

function generateMarkdown(documentation) {
    return Promise.all(documentation.map(writeFilePromise));
}

function generateHTML() {
    console.log('HTML support is not implemented yet.');
    return Promise.resolve();
}

function generateMarkdownExtensions(usedExtensions, rocCommandObject, extension) {
    const rows = [];

    const packages = usedExtensions.filter((extn) => extn.type === 'package' &&
        extn.name !== rocCommandObject.pkg.name); // FIXME
    const plugins = usedExtensions.filter((extn) => extn.type === 'plugin' &&
        extn.name !== rocCommandObject.pkg.name); // FIXME

    rows.push('# Extensions');
    rows.push('The extensions that are used in the project, indirect and direct.');
    rows.push('## Packages');
    if (packages.length > 0) {
        packages.forEach((pkg) => {
            rows.push(`### ${pkg.name} — [v${pkg.version}](https://www.npmjs.com/package/${pkg.name})`);
            const description = isFunction(pkg.description) ?
                pkg.description(rocCommandObject, extension) :
                pkg.description;

            rows.push(description);
        });
    } else {
        rows.push('No packages.');
    }

    rows.push('## Plugins');
    if (plugins.length > 0) {
        plugins.forEach((plugin) => {
            rows.push(`### ${plugin.name} — [v${plugin.version}](https://www.npmjs.com/package/${plugin.name})`);
            const description = isFunction(plugin.description) ?
                plugin.description(rocCommandObject, extension) :
                plugin.description;

            rows.push(description);
        });
    } else {
        rows.push('_No plugins._');
    }

    return rows.join('\n');
}

function generateMarkdownConfiguration(configuration, metaConfiguration, rocCommandObject) {
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

function generateReadme(name, dir, extension, rocCommandObject) {
    const {
        projectExtensions
    } = rocCommandObject;
    const rows = [];

    rows.push(`# ${name}`, '');

    // If we are documenting a extensions we will want to use the description inside projectExtensions
    if (extension) {
        const description = isFunction(projectExtensions[0].description) ?
            projectExtensions[0].description(rocCommandObject, extension) :
            projectExtensions[0].description;

        rows.push(description, '');
    } else {
        // Could add a function / property on the roc.config.js file that can be used
        rows.push('This is automatically generated documentation for your Roc project.', '');
    }

    if (extension) {
        // Do nothing at this time
    } else {
        const packages = projectExtensions.filter((extn) => extn.type === 'package');
        const plugins = projectExtensions.filter((extn) => extn.type === 'plugin');

        rows.push('## Extensions');
        rows.push('The extensions that are used in the project.');
        rows.push('### Packages');
        if (packages.length > 0) {
            packages.forEach((pkg) => {
                rows.push(`#### ${pkg.name} — [v${pkg.version}](https://www.npmjs.com/package/${pkg.name})`);
                const description = isFunction(pkg.description) ?
                    pkg.description(rocCommandObject, extension) :
                    pkg.description;

                rows.push(description);
            });
        } else {
            rows.push('No packages.');
        }

        rows.push('### Plugins');
        if (plugins.length > 0) {
            plugins.forEach((plugin) => {
                rows.push(`#### ${plugin.name} — [v${plugin.version}](https://www.npmjs.com/package/${plugin.name})`);
                const description = isFunction(plugin.description) ?
                    plugin.description(rocCommandObject, extension) :
                    plugin.description;

                rows.push(description);
            });
        } else {
            rows.push('_No plugins._');
        }
    }

    rows.push('## Documentation');
    [
        'Actions', 'Commands', 'Configuration', 'Dependencies', 'Hooks', 'Settings', 'Extensions'
    ].forEach((group) => {
        rows.push(`- [${group}](/${dir}/${group})`);
    });
    rows.push('');
    rows.push('---');
    rows.push('_Generated by [Roc](https://github.com/rocjs/roc)_');
    return rows.join('\n');
}
