import { writeFile } from 'fs';
import { join } from 'path';

import actionsToMarkdown from './actionsToMarkdown';
import commandsToMarkdown from './commandsToMarkdown';
import configurationToMarkdown from './configurationToMarkdown';
import createReadme from './createReadme';
import dependenciesToMarkdown from './dependenciesToMarkdown';
import extensionsToMarkdown from './extensionsToMarkdown';
import hooksToMarkdown from './hooksToMarkdown';
import settingsToMarkdown from './settingsToMarkdown';

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

export default function generateDocumentation({
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
            content: createReadme(name, directory, extension, rocCommandObject),
            path: extension ? `${dir}/README.md` : `${dir}/ROC.md`
        }, {
            content: actionsToMarkdown(name, rocCommandObject.actions, mode),
            // /docs || /roc-documentation
            path: `${subDir}/Actions.md`
        }, {
            content: dependenciesToMarkdown(name, rocCommandObject.dependencies),
            path: `${subDir}/Dependencies.md`
        }, {
            content: hooksToMarkdown(name, rocCommandObject.hooks, mode),
            path: `${subDir}/Hooks.md`
        }, {
            content: settingsToMarkdown(name, rocCommandObject.extensionConfig, rocCommandObject.metaObject),
            path: `${subDir}/Settings.md`
        }, {
            content: commandsToMarkdown(
                name,
                rocCommandObject.extensionConfig,
                rocCommandObject.commands,
                `${subDir}/Settings.md`,
                mode
            ),
            path: `${subDir}/Commands.md`
        }, {
            content: configurationToMarkdown(
                rocCommandObject.extensionConfig,
                rocCommandObject.metaObject,
                rocCommandObject
            ),
            path: `${subDir}/Configuration.md`
        }, {
            content: extensionsToMarkdown(
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
