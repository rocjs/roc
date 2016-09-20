import fs from 'fs';
import path from 'path';

import chalk from 'chalk';
import inquirer from 'inquirer';

import { getAbsolutePath, folderExists, fileExists } from '../../helpers';
import log from '../../log/default/small';

export default async function checkDirectory(name = '', directory = '', { force = false } = {}) {
    const directoryPath = getAbsolutePath(name, directory) || directory;

    if (folderExists(directoryPath) && name) {
        log.warn(`Found a folder named ${chalk.underline(directoryPath)}, will try to use it.`);
    }

    if (folderExists(directoryPath) && !force && fs.readdirSync(directoryPath).length > 0) {
        const { selection } = await inquirer.prompt([{
            type: 'list',
            name: 'selection',
            message: `The directory '${directoryPath}' is not empty, what do you want to do?`,
            choices: [{
                name: 'Create new folder',
                short: 'New',
                value: 'new',
            }, {
                name: 'Run anyway ' + chalk.yellow('Warning: Some files might be overwritten.'),
                short: 'Force',
                value: 'force',
            }, {
                name: 'Abort',
                value: 'abort',
            }],
        }]);

        if (selection === 'abort') {
            process.exit(0); // eslint-disable-line
        } else if (selection === 'new') {
            return await askForDirectory(directory);
        } else if (selection === 'force') {
            return {
                dir: directoryPath,
                folderName: path.basename(directoryPath),
            };
        }
    }

    return {
        dir: directoryPath,
        folderName: path.basename(directoryPath),
    };
}

async function askForDirectory(directory) {
    const { name } = await inquirer.prompt([{
        type: 'input',
        name: 'name',
        message: `What do you want to name the directory? (It will be created in '${directory || process.cwd()}')`,
    }]);

    const directoryPath = getAbsolutePath(name, directory);

    if (folderExists(directoryPath)) {
        log.warn('There is already a directory with that name');
        return await askForDirectory(directory);
    } else if (fileExists(directoryPath)) {
        log.warn('There is already a file with that name');
        return await askForDirectory(directory);
    }

    return {
        dir: directoryPath,
        folderName: path.basename(directoryPath),
    };
}
