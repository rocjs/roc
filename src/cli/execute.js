import 'source-map-support/register';

import { spawn } from 'child_process';

/**
 * Executes a command string.
 *
 * Quite simple in its current state and should be expected to change in the future.
 * Can manage multiple commands if they are divided by either & or &&. Important that there is spacing on both sides.
 *
 * @param {string} command - A command string that should run.
 */
export function execute(command) {
    const parallelCommands = command.split(/ & /);
    executeNext(parallelCommands);
}

function executeNext(parallelCommands) {
    const syncCommand = parallelCommands.shift();
    if (syncCommand) {
        const syncCommands = syncCommand.split(/ && /);
        const command = syncCommands.shift();
        const parts = command.split(/\s+/g);
        const p = spawn(parts[0], parts.slice(1), { stdio: 'inherit' });
        p.on('exit', function(code) {
            if (code) {
                /* eslint-disable no-process-exit */
                return process.exit(code);
                /* eslint-enable */
            }

            executeNext(syncCommands);
        });
        executeNext(parallelCommands);
    }
}
