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
 * @param {boolean} [silent=false] - If the command should run in silent mode, no output.
 *
 * @returns {string[]} - The output to stdout if silent was used.
 */
export default function executeSync(command, silent = false) {
    // Will run them in parallel anyway, nothing we can do about it currently
    const parallelCommands = command.split(/ & /);
    return parallelCommands.map((syncCommand) => {
        const syncCommands = syncCommand.split(/ && /);
        return runCommandSync(syncCommands, silent);
    });
}

function runCommandSync(syncCommands, silent, path = process.cwd(), results = []) {
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
            return runCommandSync(syncCommands, silent, newPath, results);
        }

        const { status, stdout, stderr } = sync(cmd, args, { cwd: path, stdio: silent ? undefined : 'inherit' });

        const newResults = [...results, stdout && stdout.toString()];

        if (status) {
            const error = new Error(`The following command returned exit status [${status}]: ${cmd} ${args.join(' ')}`);

            error.command = cmd;
            error.arguments = args;
            error.exitStatus = status;
            error.stderr = stderr && stderr.toString();
            error.stdout = newResults;

            throw error;
        }

        return runCommandSync(syncCommands, silent, path, newResults);
    }

    return results;
}
