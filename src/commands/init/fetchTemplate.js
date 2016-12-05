import path from 'path';
import fs from 'fs';

import { removeSync } from 'fs-extra';
import chalk from 'chalk';
import downloadGitRepo from 'download-git-repo';
import extract from 'extract-zip';
import gitClone from 'git-clone';
import ora from 'ora';
import temp from 'temp';

import fileExists from '../../helpers/fileExists';
import folderExists from '../../helpers/folderExists';
import getAbsolutePath from '../../helpers/getAbsolutePath';
import log from '../../log/default/small';

import { getVersions, getOfficialTemplates } from './githubHelpers';

// Automatically track and cleanup files at exit
temp.track();

const defaultVersion = 'next'; // replace with "latest" when we release as latest on npm - temporary

export function isLocal(template, directory) {
    return folderExists(template, directory) ||
        (path.extname(template) === '.zip' && fileExists(template, directory));
}

export default function fetchTemplate(template, directory, version, { clone }) {
    // The provided template is a local folder
    if (folderExists(template, directory)) {
        return getAbsolutePath(template, directory);
    }

    // The provided template is a zip file
    if (path.extname(template) === '.zip' && fileExists(template, directory)) {
        return unzip(getAbsolutePath(template, directory));
    }

    // Handle if official/listed template
    if (template.indexOf('/') === -1) {
        return getOfficialTemplate(template, version);
    }

    // A git clone url
    if (template.startsWith('git@')) {
        return cloneRepo(template, version);
    }

    // Handle GitHub templates in first class way, for better support of versions
    if (!clone && isGitHub(template)) {
        return github(template, version);
    }

    // Otherwise try to use download-git-repo
    return download(template, version, clone);
}

function unzip(template) {
    const tmp = temp.mkdirSync('roc-template');

    return new Promise((resolve) => {
        extract(template, { dir: tmp }, (error) => {
            if (error) {
                log.error(`Failed to extract template from "${template}"`, error);
            }
            const files = fs.readdirSync(tmp);
            if (files.length !== 1) {
                log.error(`The template seems no to be structured correctly "${template}"`);
            }

            resolve(path.join(tmp, files[0]));
        });
    });
}

async function getOfficialTemplate(template, version) {
    try {
        const templates = await getOfficialTemplates();

        // Match on the fullname and the short name
        const selectedTemplate = templates.find(({ name }) => name === template || name === `roc-template-${template}`);

        if (!selectedTemplate) {
            log.error(`Could not find a template matching ${chalk.bold(template)}, ` +
                'run command without arguments to list the official ones');
        }

        return github(selectedTemplate.full_name, version);
    } catch (error) {
        log.error('Failed to fetch the list of official templates', error);
    }
}

async function github(template, version) {
    // Temporary to get next for the moment
    if (!version) {
        version = defaultVersion; // eslint-disable-line
        log.info(`Will use ${chalk.bold(version)} as default version`);
    }

    // Get the versions for the template if no version is provided or it starts with a number
    if (!version || !isNaN(Number(version.charAt(0)))) {
        try {
            const versions = await getVersions(template);

            // Add master so we always have a way to install it
            versions.push({ name: 'master' });

            // Add v to numeric versions
            const selectVersion = (
                version &&
                !isNaN(Number(version.charAt(0))) &&
                version.charAt(0) !== 'v'
            ) ? `v${version}` : version;

            const selectedVersion = versions.find((v) => v.name === selectVersion);
            // eslint-disable-next-line
            version = (selectedVersion && selectedVersion.name) || // Try to get the requested version
                (versions[0] && versions[0].name) || // Otherwise take the latest version
                defaultVersion; // Fallback to use latest

            if (!selectedVersion && selectVersion) {
                log.warn(`Selected template version not found, using ${chalk.bold(version)}`);
            } else if (!selectedVersion) {
                log.info(`Using ${chalk.bold(version)} as template version`);
            }
        } catch (error) {
            version = defaultVersion; // eslint-disable-line
            log.info(`Failed to fetch versions, will fallback to ${chalk.bold(version)}`, error);
        }
    }

    return download(template, version);
}

function download(template, version, clone = false) {
    if (!version) {
        version = defaultVersion; // eslint-disable-line
        log.info(`Will use ${chalk.bold(version)} as default version`);
    }

    const tmp = temp.mkdirSync('roc-template');

    const spinner = ora('Downloading template').start();

    return new Promise((resolve) => {
        try {
            downloadGitRepo(`${template}${version && '#' + encodeURIComponent(version)}`, tmp, { clone }, (error) => {
                if (error) {
                    spinner.fail();
                    log.error(
                        `Failed to download the template from ${chalk.bold(template)} using ${chalk.bold(version)}`,
                        error
                    );
                }

                spinner.succeed();
                resolve(tmp);
            });
        } catch (error) {
            log.error('An error happened when downloading the template.', error);
        }
    });
}

function cloneRepo(template, version) {
    if (!version) {
        version = defaultVersion; // eslint-disable-line
        log.info(`Will use ${chalk.bold(version)} as default version`);
    }

    const tmp = temp.mkdirSync('roc-template');

    const spinner = ora('Downloading template').start();
    return new Promise((resolve) => {
        try {
            gitClone(template, tmp, { checkout: version }, (error) => {
                if (error) {
                    spinner.fail();
                    log.error(
                        `Failed to download the template from ${chalk.bold(template)} using ${chalk.bold(version)}`,
                        error
                    );
                }

                spinner.succeed();

                removeSync(path.join(tmp, '.git'));
                resolve(tmp);
            });
        } catch (error) {
            log.error('An error happened when downloading the template.', error);
        }
    });
}


export function isGitHub(template) {
    return template.indexOf(':') === -1 && (template.match(/\//g) || []).length === 1;
}
