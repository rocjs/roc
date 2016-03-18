import { join } from 'path';
import { spawn, spawnSync } from 'child_process';

/**
 * Executes a command string.
 *
 * Quite simple in its current state and should be expected to change in the future.
 * Can manage multiple commands if they are divided by either & or &&. Important that there is spacing on both sides.
 *
 * @param {string} command - A command string that should run.
 * @returns {Promise} - A promise that is resolved when all the commands are completed.
 */
export function execute(command) {
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
            return runCommand(syncCommands, join(path, args[0]));
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

/**
 * Executes a command string in a synchronous manner.
 *
 * Quite simple in its current state and should be expected to change in the future.
 * Can manage multiple commands if they are divided by either & or &&. Important that there is spacing on both sides.
 *
 * @param {string} command - A command string that should run.
 */
export function executeSync(command) {
    // Will run them in parallel anyway, nothing we can do about it currently
    const parallelCommands = command.split(/ & /);
    parallelCommands.forEach((syncCommand) => {
        const syncCommands = syncCommand.split(/ && /);
        const status = runCommandSync(syncCommands);

        if (status) {
            /* eslint-disable no-process-exit */
            process.exit(status);
            /* eslint-enable */
        }
    });
}

function runCommandSync(syncCommands, path = process.cwd()) {
    const command = syncCommands.shift();

    if (command) {
        const parts = getParts(command);
        const cmd = parts[0];
        const args = parts.slice(1);

        // If the command is to change directory we will carry the path over to the next command.
        if (cmd === 'cd') {
            return runCommandSync(syncCommands, join(path, args[0]));
        }

        const { status } = spawnSync(cmd, args, { stdio: 'inherit', cwd: path });

        if (status) {
            return status;
        }

        return runCommandSync(syncCommands, path);
    }
}

/**
 * Will take a command string an return an array with the different parts of the command.
 *
 * Will manage command parts that has been grouped with " or '.
 *
 * @param {string} commandString - The string to split up into parts.
 *
 * @returns {string[]} - An array with the different parts of the command.
 */
function getParts(commandString) {
    const regex = /[^\s"']+|"([^"]*)"|'([^']*)'/g;
    const parts = [];
    let match;

    while ((match = regex.exec(commandString))) {
        parts.push(match[1] || match[2] || match[0]);
    }

    return parts;
}
