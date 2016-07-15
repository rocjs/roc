import { writeFile, mkdirSync } from 'fs';
import { join } from 'path';

import { underline } from 'chalk';

import log from '../../log/default/small';
import folderExists from '../../helpers/folderExists';

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
    project = false,
    extension = false
}) {
    const dir = rocCommandObject.directory;
    const documentationDir = join(dir, directory);
    const name = rocCommandObject.context.packageJSON.name;

    // Create the folder if it does not exist.
    if (!folderExists(documentationDir)) {
        mkdirSync(documentationDir);
    }

    const config = project ?
        rocCommandObject.context.config :
        rocCommandObject.context.extensionConfig;

    const documentation = [
        {
            content: createReadme(name, directory, extension, rocCommandObject),
            path: extension ? `${dir}/README.md` : `${dir}/ROC.md`
        }, {
            content: actionsToMarkdown(name, rocCommandObject.context.actions, mode, project),
            path: `${documentationDir}/Actions.md`
        }, {
            content: dependenciesToMarkdown(name, extension, rocCommandObject.context.dependencies),
            path: `${documentationDir}/Dependencies.md`
        }, {
            content: hooksToMarkdown(name, rocCommandObject.context.hooks, mode),
            path: `${documentationDir}/Hooks.md`
        }, {
            content: settingsToMarkdown(name, config, rocCommandObject.context.meta),
            path: `${documentationDir}/Settings.md`
        }, {
            content: commandsToMarkdown(
                name,
                rocCommandObject.context.extensionConfig,
                rocCommandObject.context.commands,
                `${documentationDir}/Settings.md`,
                mode
            ),
            path: `${documentationDir}/Commands.md`
        }, {
            content: configurationToMarkdown(
                name,
                rocCommandObject.context.extensionConfig,
                rocCommandObject.context.meta,
                rocCommandObject
            ),
            path: `${documentationDir}/Configuration.md`
        }, {
            content: extensionsToMarkdown(
                name,
                rocCommandObject.context.usedExtensions,
                rocCommandObject,
                extension
            ),
            path: `${documentationDir}/Extensions.md`
        }
    ];

    const documentations = [];
    if (markdown) {
        documentations.push(generateMarkdown(documentation));
    }
    if (html) {
        documentations.push(generateHTML(documentation));
    }

    return Promise.all(documentations)
        .then(() => log.done(`Documentation has been generated in ${underline(documentationDir)}`));
}

function generateMarkdown(documentation) {
    return Promise.all(documentation.map(writeFilePromise));
}

function generateHTML() {
    console.log('HTML support is not implemented yet.');
    return Promise.resolve();
}
