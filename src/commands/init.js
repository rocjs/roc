import fs from 'fs-extra';
import path, { join } from 'path';
import { spawn } from 'cross-spawn';
import inquirer from 'inquirer';
import replace from 'replace';
import chalk from 'chalk';

import log from '../log/default/small';
import validRocProject from '../helpers/validRocProject';
import { getAbsolutePath } from '../helpers';

import { get, getVersions } from './helpers/github';
import unzip from './helpers/unzip';

/* This should be fetched from a server!
 */
const templates = [{
    name: 'Simple Roc App',
    description: 'A simple start on a generic web application',
    identifier: 'web-app',
    repo: 'rocjs/roc-template-web-app'
}, {
    name: 'Simple Roc React App',
    description: 'A simple start on a React web application',
    identifier: 'web-app-react',
    repo: 'rocjs/roc-template-web-app-react'
}];

/**
 * Command used to init a new Roc project.
 *
 * @param {rocCommandObject} parsedArguments - The Roc command object, uses parsedArguments from it.
 *
 * @returns {Promise} - Promise for the command.
 */
export default function init({ parsedArguments, parsedOptions, directory }) {
    const { list, force } = parsedOptions.options;
    const { name, template, version } = parsedArguments.arguments;

    // Get versions first
    if (template && list) {
        const toFetch = getTemplate(template);

        return getTemplateVersion(toFetch, list);
    }

    // Make sure the directory is empty!
    return checkFolder(force, name, directory).then((dir) => {
        if (!template) {
            return interactiveMenu(dir, list);
        }

        return fetchTemplate(template, version, dir, list);
    });
}

/*
 * Helpers
 */

function isLocalTemplate(template = '') {
    return template.indexOf('.zip') === template.length - 4;
}

function getTemplateVersion(toFetch, list) {
    return getVersions(toFetch)
        .then((versions) => {
            // Add master so we always have a way to install it
            versions.push({name: 'master'});

            if (list) {
                log.info('The available versions are:');
                log.info(Object.keys(versions).map((index) => ` ${versions[index].name}`).join('\n'));
                process.exit(0); // eslint-disable-line
            }

            return Promise.resolve(versions);
        });
}

function getTemplate(template) {
    if (isLocalTemplate(template)) {
        return template;
    } else if (template.indexOf('/') === -1) {
        const selectedTemplate = templates.find((elem) => elem.identifier === template);
        if (!selectedTemplate) {
            log.error('Invalid template name given.');
        }

        return selectedTemplate.repo;
    }

    return template;
}

function fetchTemplate(toFetch, selectVersion, directory, list) {
    toFetch = getTemplate(toFetch);

    const templateFetcher = isLocalTemplate(toFetch) ?
        unzip(toFetch) :
        getTemplateVersion(toFetch, list).then((versions) => {
            // If the name starts with a number we will automatically add 'v' infront of it to match Github default
            if (selectVersion && !isNaN(Number(selectVersion.charAt(0))) && selectVersion.charAt(0) !== 'v') {
                selectVersion = `v${selectVersion}`;
            }

            const selectedVersion = versions.find((v) => v.name === selectVersion);
            const actualVersion = selectedVersion && selectedVersion.name ||
                versions[0] && versions[0].name ||
                'master';

            if (!selectedVersion && selectVersion) {
                log.warn(`Selected template version not found, using ${chalk.bold(actualVersion)}`);
            } else if (!selectedVersion) {
                log.note(`Using ${chalk.bold(actualVersion)} as template version`);
            }

            return get(toFetch, actualVersion);
        });

    return templateFetcher
        .then((dirPath) => {
            if (!validRocProject(path.join(dirPath, 'template'))) {
                log.error('Seems like this is not a Roc template.');
            } else {
                log.info('\nInstalling template setup dependencies…');
                return npmInstall(dirPath);
            }
        })
        .then((dirPath) => {
            inquirer.prompt(getPrompt(dirPath), (answers) => {
                replaceTemplatedValues(answers, dirPath);
                configureFiles(dirPath, directory);

                log.info(`\nInstalling template dependencies… ` +
                    `${chalk.dim('(If this fails you can try to run npm install directly)')}`);
                return npmInstall(directory).then(() => {
                    log.done('\nSetup completed!\n');
                    showCompletionMessage(dirPath);
                });
            });
        })
        .catch((err) => {
            log.error('An error occured during init!', err);
        });
}

function getPrompt(dirPath) {
    try {
        return require(path.join(dirPath, 'roc.setup.js')).prompt;
    } catch (err) {
        return require('./helpers/defaultPrompt').defaultPrompt;
    }
}

function showCompletionMessage(dirPath) {
    try {
        log.info(require(path.join(dirPath, 'roc.setup.js')).completionMessage);
    } catch (err) {
        // Do nothing
    }
}

function replaceTemplatedValues(answers, dirPath) {
    // 1. Replace content
    Object.keys(answers).map((key) => {
        replace({
            regex: `{{\\s*${key}*\\s*}}`,
            replacement: answers[key],
            paths: [dirPath + '/template'],
            recursive: true,
            silent: true
        });
    });

    // 2. Replace filenames
    replaceTemplatedValuesInDirectory(answers, join(dirPath, 'template'));
}

function replaceTemplatedValuesInDirectory(answers, dir) {
    const matchTemplate = /{{\s*([^\s]+)*\s*}}/;

    fs.readdirSync(dir)
        .forEach((file) => {
            let currentPath = join(dir, file);
            // Get potential "key" from filenames
            const match = file.match(matchTemplate);

            // Try to replace key if one was found
            if (match) {
                const toReplace = answers[match[1]];

                if (!toReplace) {
                    log.warn(`Could not find a value for the template value: {{ ${match[1]} }}`);
                } else {
                    const newFilename = file.replace(matchTemplate, toReplace);
                    fs.renameSync(currentPath, join(dir, newFilename));
                    currentPath = join(dir, newFilename);
                }
            }

            if (fs.lstatSync(currentPath).isDirectory()) {
                replaceTemplatedValuesInDirectory(answers, currentPath);
            }
        });
}

function configureFiles(dirPath, directory) {
    // Rename package.json to .roc for history purposes
    fs.renameSync(path.join(dirPath, 'package.json'), path.join(dirPath, 'template', '.roc'));

    // Move everything inside template to the current working directory
    fs.copySync(path.join(dirPath, 'template'), directory);
}

function npmInstall(dirPath) {
    return new Promise((resolve, reject) => {
        // Run npm install
        const npm = spawn('npm', ['install', '--loglevel=error'], {
            cwd: dirPath,
            stdio: 'inherit'
        });

        npm.on('close', function(code) {
            if (code !== 0) {
                return reject(new Error('npm install failed with status code: ' + code));
            }

            return resolve(dirPath);
        });
    });
}

function interactiveMenu(directory, list) {
    return new Promise((resolve) => {
        const choices = templates.map((elem) => ({ name: elem.name, value: elem.identifier }));

        inquirer.prompt([{
            type: 'rawlist',
            name: 'option',
            message: 'Selected a type',
            choices: choices
        }], answers => {
            resolve(fetchTemplate(answers.option, undefined, directory, list));
        });
    });
}

function checkFolder(force = false, directoryName = '', directory = '') {
    return new Promise((resolve) => {
        const directoryPath = getAbsolutePath(path.join(directory, directoryName));
        fs.mkdir(directoryPath, (err) => {
            if (err && directoryName) {
                log.warn(`Found a folder named ${chalk.underline(directoryPath)}, will try to use it.\n`);
            }

            if (!force && fs.readdirSync(directoryPath).length > 0) {
                inquirer.prompt([{
                    type: 'list',
                    name: 'selection',
                    message: `The directory '${directoryPath}' is not empty, what do you want to do?`,
                    choices: [{
                        name: 'Create new folder',
                        value: 'new'
                    }, {
                        name: 'Run anyway ' + chalk.yellow('Warning: Some files might be overwritten.'),
                        value: 'force'
                    }, {
                        name: 'Abort',
                        value: 'abort'
                    }]
                }], ({ selection }) => {
                    if (selection === 'abort') {
                        process.exit(0); // eslint-disable-line
                    } else if (selection === 'new') {
                        askForDirectory(directory, resolve);
                    } else if (selection === 'force') {
                        resolve(directoryPath);
                    }
                });
            } else {
                resolve(directoryPath);
            }
        });
    });
}

function askForDirectory(directory, resolve) {
    inquirer.prompt([{
        type: 'input',
        name: 'name',
        message: `What do you want to name the directory? (It will be created in '${directory || process.cwd()}')`
    }], ({ name }) => {
        const directoryPath = getAbsolutePath(name, directory);
        fs.mkdir(directoryPath, (err) => {
            if (err) {
                log.warn('The directory did already exists or was not empty.\n');
                return askForDirectory(resolve);
            }

            resolve(directoryPath);
        });
    });
}
