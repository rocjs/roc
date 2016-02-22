import { spawn } from 'child_process';

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
    return executeNext(parallelCommands);
}

function executeNext(parallelCommands) {
    const syncCommand = parallelCommands.shift();
    if (syncCommand) {
        return Promise.all([runCommand(syncCommand), executeNext(parallelCommands)]);
    }
    return Promise.resolve();
}

function runCommand(syncCommand) {
    const syncCommands = syncCommand.split(/ && /);
    const command = syncCommands.shift();
    const parts = command.split(/\s+/g);
    const cmd = parts[0];
    const args = parts.slice(1);
    return new Promise((resolve) => {
        spawn(cmd, args, { stdio: 'inherit' })
            .on('exit', function(code) {
                if (code) {
                    /* eslint-disable no-process-exit */
                    return process.exit(code);
                    /* eslint-enable */
                }
                executeNext(syncCommands).then(resolve);
            });
    });
}
