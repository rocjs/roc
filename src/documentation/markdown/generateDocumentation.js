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

const writeFilePromise = (file) =>
    new Promise((resolve, reject) => {
        writeFile(file.path, file.content, (err) => {
            if (err) {
                return reject(err);
            }

            return resolve();
        });
    });

export default function generateDocumentation({
    commandObject,
    directory = 'docs',
    html = false,
    markdown = true,
    mode,
    project = false,
    extension = false,
}) {
    const dir = commandObject.context.directory;
    const documentationDir = join(dir, directory);
    const name = commandObject.context.packageJSON.name;

    // Create the folder if it does not exist.
    if (!folderExists(documentationDir)) {
        mkdirSync(documentationDir);
    }

    const config = project ?
        commandObject.context.config :
        commandObject.context.extensionConfig;

    const documentation = [
        {
            content: createReadme(name, directory, extension, commandObject),
            path: extension ? `${dir}/README.md` : `${dir}/ROC.md`,
        }, {
            content: actionsToMarkdown(name, commandObject.context.actions, mode, project),
            path: `${documentationDir}/Actions.md`,
        }, {
            content: dependenciesToMarkdown(name, extension, commandObject.context.dependencies),
            path: `${documentationDir}/Dependencies.md`,
        }, {
            content: hooksToMarkdown(name, commandObject.context.hooks, mode),
            path: `${documentationDir}/Hooks.md`,
        }, {
            content: settingsToMarkdown(name, config, commandObject.context.meta),
            path: `${documentationDir}/Settings.md`,
        }, {
            content: commandsToMarkdown(
                name,
                commandObject.context.extensionConfig,
                commandObject.context.commands,
                `${directory}/Settings.md`,
                mode
            ),
            path: `${documentationDir}/Commands.md`,
        }, {
            content: configurationToMarkdown(
                name,
                commandObject.context.extensionConfig,
                commandObject.context.meta,
                commandObject
            ),
            path: `${documentationDir}/Configuration.md`,
        }, {
            content: extensionsToMarkdown(
                name,
                commandObject.context.usedExtensions,
                commandObject,
                extension
            ),
            path: `${documentationDir}/Extensions.md`,
        },
    ];

    const documentations = [];
    if (markdown) {
        documentations.push(generateMarkdown(documentation));
    }
    if (html) {
        documentations.push(generateHTML(documentation));
    }

    return Promise.all(documentations)
        .then(() => log.success(`Documentation has been generated in ${underline(documentationDir)}`));
}

function generateMarkdown(documentation) {
    return Promise.all(documentation.map(writeFilePromise));
}

function generateHTML() {
    console.log('HTML support is not implemented yet.');
    return Promise.resolve();
}
