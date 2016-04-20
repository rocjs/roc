import fs from 'fs-extra';
import path, { join } from 'path';
import { spawn } from 'cross-spawn';
import inquirer from 'inquirer';
import replace from 'replace';
import chalk from 'chalk';

import { get, getVersions } from './helpers/github';
import { validRocProject } from './helpers/general';
import { error, warning, info, ok } from '../helpers/style';

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
export default function init({ parsedArguments, parsedOptions }) {
    const { list, force } = parsedOptions.options;
    const { name, template, version } = parsedArguments.arguments;

    // Get versions first
    if (template && list) {
        const toFetch = getTemplate(template);

        return getTemplateVersion(toFetch, list);
    }

    // Make sure the directory is empty!
    return checkFolder(force, name).then((directory) => {
        if (!template) {
            return interactiveMenu(directory, list);
        }

        return fetchTemplate(template, version, directory, list);
    });
}

/*
 * Helpers
 */

function getTemplateVersion(toFetch, list) {
    return getVersions(toFetch)
        .then((versions) => {
            // Add master so we always have a way to install it
            versions.push({name: 'master'});

            if (list) {
                console.log('The available versions are:');
                console.log(Object.keys(versions).map((index) => ` ${versions[index].name}`).join('\n'));
                /* eslint-disable no-process-exit */
                process.exit(0);
                /* eslint-enable */
            }

            return Promise.resolve(versions);
        });
}

function getTemplate(template) {
    if (template.indexOf('/') === -1) {
        const selectedTemplate = templates.find((elem) => elem.identifier === template);
        if (!selectedTemplate) {
            console.log(error('Invalid template name given.'));
            /* eslint-disable no-process-exit */
            process.exit(1);
            /* eslint-enable */
        }

        return selectedTemplate.repo;
    }

    return template;
}

function fetchTemplate(toFetch, selectVersion, directory, list) {
    toFetch = getTemplate(toFetch);

    return getTemplateVersion(toFetch, list)
        .then((versions) => {
            // If the name starts with a number we will automatically add 'v' infront of it to match Github default
            if (selectVersion && !isNaN(Number(selectVersion.charAt(0))) && selectVersion.charAt(0) !== 'v') {
                selectVersion = `v${selectVersion}`;
            }

            const selectedVersion = versions.find((v) => v.name === selectVersion);
            const actualVersion = selectedVersion && selectedVersion.name ||
                versions[0] && versions[0].name ||
                'master';

            if (!selectedVersion && selectVersion) {
                console.log(
                    warning(`Selected template version not found, using ${chalk.bold(actualVersion)}`)
                );
            } else if (!selectedVersion) {
                console.log(info(`Using ${chalk.bold(actualVersion)} as template version`));
            }

            return get(toFetch, actualVersion);
        })
        .then((dirPath) => {
            if (!validRocProject(path.join(dirPath, 'template'))) {
                /* eslint-disable no-process-exit */
                console.log(error('Seems like this is not a Roc template.'));
                process.exit(1);
                /* eslint-enable */
            } else {
                console.log('\nInstalling template setup dependencies…');
                return npmInstall(dirPath);
            }
        })
        .then((dirPath) => {
            inquirer.prompt(getPrompt(dirPath), (answers) => {
                replaceTemplatedValues(answers, dirPath);
                configureFiles(dirPath, directory);

                console.log(`\nInstalling template dependencies… ` +
                    `${chalk.dim('(If this fails you can try to run npm install directly)')}`);
                return npmInstall(directory).then(() => {
                    console.log(ok('\nSetup completed!\n'));
                    showCompletionMessage(dirPath);
                });
            });
        })
        .catch((err) => {
            console.log(error('\nAn error occured during init!\n'));
            console.error(err.message);
            /* eslint-disable no-process-exit */
            process.exit(1);
            /* eslint-enable */
        });
}

function getPrompt(dirPath) {
    try {
        return require(path.join(dirPath, 'roc.setup.js')).prompt;
    } catch (err) {
        return require('./helpers/default-prompt').defaultPrompt;
    }
}

function showCompletionMessage(dirPath) {
    try {
        console.log(require(path.join(dirPath, 'roc.setup.js')).completionMessage);
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
                    console.log(`Could not find a value for the template value: {{ key }}`);
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

function checkFolder(force = false, directoryName = '') {
    return new Promise((resolve) => {
        const directoryPath = path.join(process.cwd(), directoryName);
        fs.mkdir(directoryPath, (err) => {
            if (directoryName && err) {
                console.log(
                    warning(`Found a folder named ${chalk.underline(directoryName)} at ` +
                        `${chalk.underline(process.cwd())}, will try to use it.`)
                , '\n');
            }

            if (!force && fs.readdirSync(directoryPath).length > 0) {
                inquirer.prompt([{
                    type: 'list',
                    name: 'selection',
                    message: 'The directory is not empty, what do you want to do?',
                    choices: [{
                        name: 'Create new folder',
                        value: 'new'
                    }, {
                        name: 'Run anyway ' + warning('Warning: Some files might be overwritten.'),
                        value: 'force'
                    }, {
                        name: 'Abort',
                        value: 'abort'
                    }]
                }], ({ selection }) => {
                    if (selection === 'abort') {
                        /* eslint-disable no-process-exit */
                        process.exit(1);
                        /* eslint-enable */
                    } else if (selection === 'new') {
                        askForDirectory(resolve);
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

function askForDirectory(resolve) {
    inquirer.prompt([{
        type: 'input',
        name: 'name',
        message: 'What do you want to name the directory?'
    }], ({ name }) => {
        const directoryPath = path.join(process.cwd(), name);
        fs.mkdir(directoryPath, (err) => {
            if (err) {
                console.log(warning('The directory did already exists or was not empty.'), '\n');
                return askForDirectory(resolve);
            }

            resolve(directoryPath);
        });
    });
}
