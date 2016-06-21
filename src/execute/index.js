import { join } from 'path';

import { spawn } from 'cross-spawn';

import getParts from './helpers/getParts';

/**
 * Executes a command string.
 *
 * Quite simple in its current state and should be expected to change in the future.
 * Can manage multiple commands if they are divided by either & or &&. Important that there is spacing on both sides.
 *
 * @param {string} command - A command string that should run.
 * @returns {Promise} - A promise that is resolved when all the commands are completed.
 */
export default function execute(command) {
    const parallelCommands = command.split(/ & /);
    return executeParallel(parallelCommands);
}

function executeParallel(parallelCommands, path = process.cwd()) {
    const syncCommand = parallelCommands.shift();
    if (syncCommand) {
        return Promise.all([executeCommand(syncCommand, path), executeParallel(parallelCommands, path)]);
    }
    return Promise.resolve();
}

function executeCommand(syncCommand, path = process.cwd()) {
    const syncCommands = syncCommand.split(/ && /);
    return runCommand(syncCommands, path);
}

function runCommand(syncCommands, path = process.cwd()) {
    const command = syncCommands.shift();

    if (command) {
        const parts = getParts(command);
        const cmd = parts[0];
        const args = parts.slice(1);

        // If the command is to change directory we will carry the path over to the next command.
        if (cmd === 'cd') {
            // If the path is absolute, starts with a /, we will not join in with the previous
            const newPath = args[0].charAt(0) === '/' ?
                args[0] : join(path, args[0]);
            return runCommand(syncCommands, newPath);
        }

        return new Promise((resolve, reject) => {
            spawn(cmd, args, { stdio: 'inherit', cwd: path })
                .on('exit', (code) => {
                    if (code !== 0) {
                        return reject(code);
                    }

                    return runCommand(syncCommands, path)
                        .then(resolve)
                        .catch(reject);
                });
        });
    }
    return Promise.resolve();
}
