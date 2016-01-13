import 'source-map-support/register';

import fs from 'fs-extra';
import path from 'path';
import { spawn } from 'child_process';
import inquirer from 'inquirer';
import replace from 'replace';
import chalk from 'chalk';

import { get, getVersions } from './helpers/github';
import { validRocProject } from './helpers/general';

/* This should be fetched from a server!
 */
const templates = [{
    name: 'Simple Roc App',
    description: 'A simple start on a generic web application',
    identifier: 'web',
    repo: 'vgno/roc-template-web'
}, {
    name: 'Simple Roc React App',
    description: 'A simple start on a React web application',
    identifier: 'web-react',
    repo: 'vgno/roc-template-web-react'
}];

/**
 * Command used to init a new Roc project.
 *
 * @param {rocCommandObject} parsedArguments - The Roc command object, uses parsedArguments from it.
 *
 * @returns {Promise} - Promise for the command.
 */
export default function init({ parsedOptions }) {
    const { template, version } = parsedOptions.options;

    // Make sure the directory is empty!
    assertEmptyDir();

    if (!template) {
        return interativeMenu();
    }

    return fetchTemplate(template, version);

    /*
     * Helpers
     */
    function fetchTemplate(toFetch, selectVersion) {
        if (toFetch.indexOf('/') === -1) {
            const selectedTemplate = templates.find((elem) => elem.identifier === toFetch);
            if (!selectedTemplate) {
                console.log('Invalid name given.');
                /* eslint-disable no-process-exit */
                process.exit(1);
                /* eslint-enable */
            }

            toFetch = selectedTemplate.repo;
        }

        return getVersions(toFetch)
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
                    console.log(`Could not find the selected version, will instead use ${chalk.bold(actualVersion)}`);
                } else if (!selectedVersion) {
                    console.log(`Using ${chalk.bold(actualVersion)} as version`);
                }

                return get(toFetch, actualVersion);
            })
            .then((dirPath) => {
                if (!validRocProject(path.join(dirPath, 'template'))) {
                    /* eslint-disable no-process-exit */
                    console.log('Seems like this is not a Roc template.');
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
                    configureFiles(dirPath);

                    console.log(`\nInstalling template dependencies… ` +
                        `${chalk.dim('(If this fails you can always try to run npm install directly)')}`);
                    return npmInstall().then(() => {
                        console.log(chalk.green('\nSetup completed!\n'));
                        console.log(`Start in dev mode by typing ${chalk.bold('roc dev')}`);
                    });
                });
            })
            .catch((error) => {
                console.log(chalk.red('\nAn error occured during init!\n'));
                console.error(error.stack);
                /* eslint-disable no-process-exit */
                process.exit(1);
                /* eslint-enable */
            });
    }

    function getPrompt(dirPath) {
        try {
            return require(path.join(dirPath, 'roc.setup.js')).prompt;
        } catch (error) {
            return require('./helpers/default-prompt').prompt;
        }
    }

    function replaceTemplatedValues(answers, dirPath) {
        Object.keys(answers).map((key) => {
            replace({
                regex: `{{\\s*${key}*\\s*}}`,
                replacement: answers[key],
                paths: [dirPath + '/template'],
                recursive: true,
                silent: true
            });
        });
    }

    function configureFiles(dirPath) {
        // Rename package.json to .roc for history purposes
        fs.renameSync(path.join(dirPath, 'package.json'), path.join(dirPath, 'template', '.roc'));

        // Move everything inside template to the current working directory
        fs.copySync(path.join(dirPath, 'template'), process.cwd());
    }

    function npmInstall(dirPath) {
        return new Promise((resolve, reject) => {
            dirPath = dirPath || process.cwd();
            // Run npm install
            const npm = spawn('npm', ['install'], {
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

    function interativeMenu() {
        return new Promise((resolve) => {
            const choices = templates.map((elem) => ({ name: elem.name, value: elem.identifier }));

            inquirer.prompt([{
                type: 'rawlist',
                name: 'option',
                message: 'Selected a type',
                choices: choices
            }], answers => {
                resolve(fetchTemplate(answers.option));
            });
        });
    }

    function assertEmptyDir() {
        if (fs.readdirSync(process.cwd()).length > 0) {
            console.log(chalk.yellow('You need to call this command from an empty directory.'));
            /* eslint-disable no-process-exit */
            process.exit(1);
            /* eslint-enable */
        }
    }
}
