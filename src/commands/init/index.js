import path from 'path';

import { spawn } from 'cross-spawn';
import inquirer from 'inquirer';
import ora from 'ora';
import { copySync } from 'fs-extra';
import semver from 'semver';
import chalk from 'chalk';

import log from '../../log/default/small';
import fileExists from '../../helpers/fileExists';
import folderExists from '../../helpers/folderExists';
import getPackageJSON from '../../helpers/getPackageJSON';

import { getVersions, getOfficialTemplates } from './githubHelpers';
import generateTemplate from './generateTemplate';
import checkFolder from './checkFolder';
import fetchTemplate, { isGithub, isLocal } from './fetchTemplate';

export default async function init({
    arguments: { managed: managedArguments },
    options: { managed: managedOptions },
    context: { directory, verbose },
}) {
    const { 'list-versions': listVersions, force, clone } = managedOptions;
    const { name, version } = managedArguments;
    let { template } = managedArguments;

    // 0. Show a list of official templates if template name was provided
    if (!template) {
        template = await showListOfTemplates();
    }

    if (listVersions) {
        if (isLocal(template, directory)) {
            return log.note('You can’t list versions for local templates');
        } else if (template.indexOf('/') === -1 || isGithub(template)) {
            try {
                const templateVersions = await getVersions(template);

                // Add master so we always have a way to install it
                templateVersions.push({ name: 'master' });

                log.info('The available versions are:');
                return log.info(
                    templateVersions
                        .map(({ name: templateVersion }) => ` ${templateVersion}`).join('\n')
                );
            } catch (error) {
                log.error('Could not get the versions for the requested template', error);
            }
        }

        return log.note('Can’t list versions for the provided template');
    }

    // 1. Check if directory is empty
    const { dir, folderName } = await checkFolder(name, directory, { force });

    // 3. Download the template
    const templateDir = await fetchTemplate(template, directory, version, { clone });

    // 4. Validate the template
    validateTemplateDirectory(templateDir);

    // 5. Install potential dependencies that the template have
    await installTemplateDependencies(templateDir, { verbose });

    validateRequiredVersion(templateDir);

    // 5. Process template
    generateTemplate(folderName, templateDir, dir, () => {
        // Copy & Rename the template package.json for history/documentation purposes
        copySync(path.join(templateDir, 'package.json'), path.join(dir, '.roc'));
    });
}

function validateTemplateDirectory(templateDir) {
    if (!folderExists(path.join(templateDir, 'template'))) {
        log.error('Seems like this is not a Roc template.');
    }
}

function validateRequiredVersion(templateDir) {
    // This will eventually be defined by the roc-plugin-create
    const createVersion = '1.0.0';

    const checkVersion = (file) => {
        if (fileExists(file)) {
            const { required } = require(file); // eslint-disable-line
            if (required && !semver.satisfies(createVersion, required)) {
                log.error('The template requires another version of the template logic\n' +
                    `  ${chalk.bold('Requested:')} ${required} ${chalk.bold('Current:')} ${createVersion}`);
            }
        }
    };

    checkVersion(path.join(templateDir, 'roc.setup.json'));
    checkVersion(path.join(templateDir, 'roc.setup.js'));
}

async function installTemplateDependencies(templateDir, { verbose }) {
    if (
        fileExists('roc.setup.js', templateDir) &&
        fileExists('package.json', templateDir) &&
        Object.keys(getPackageJSON(templateDir).dependencies || {}).length > 0
    ) {
        const spinner = ora('Installing template setup dependencies from npm, this may take a little while').start();
        try {
            await npmInstall(templateDir, verbose);
        } catch (error) {
            spinner.fail();
        }
        spinner.succeed();
    }
}

function npmInstall(dirPath, verbose) {
    return new Promise((resolve, reject) => {
        // Run npm install
        const npm = spawn('npm', ['install', `--loglevel=${verbose ? 'verbose' : 'silent'}`], {
            cwd: dirPath,
            stdio: verbose && 'inherit',
        });

        npm.on('close', (code) => {
            if (code !== 0) {
                return reject(new Error('npm install failed with status code: ' + code));
            }

            return resolve();
        });
    });
}


async function showListOfTemplates() {
    const spinner = ora('Fetching list of official templates').start();
    const templates = await getOfficialTemplates();
    spinner.stop();

    const choices = templates.map((template) => ({
        name: `${template.name}${template.description && ' - ' + template.description}`,
        short: template.name,
        value: template.full_name,
    }));

    const { option } = await inquirer.prompt([{
        type: 'rawlist',
        name: 'option',
        message: 'Selected a template',
        choices,
    }]);

    return option;
}
