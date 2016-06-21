import { join } from 'path';

import { sync } from 'cross-spawn';

import getParts from './helpers/getParts';

/**
 * Executes a command string in a synchronous manner.
 *
 * Quite simple in its current state and should be expected to change in the future.
 * Can manage multiple commands if they are divided by either & or &&. Important that there is spacing on both sides.
 *
 * @param {string} command - A command string that should run.
 */
export default function executeSync(command) {
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
            // If the path is absolute, starts with a /, we will not join in with the previous
            const newPath = args[0].charAt(0) === '/' ?
                args[0] : join(path, args[0]);
            return runCommandSync(syncCommands, newPath);
        }

        const { status } = sync(cmd, args, { stdio: 'inherit', cwd: path });

        if (status) {
            return status;
        }

        return runCommandSync(syncCommands, path);
    }
}
