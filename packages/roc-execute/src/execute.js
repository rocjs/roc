import spawnCommand from 'spawn-command';

import getEnv from './helpers/getEnv';
import getCommand from './helpers/getCommand';
import ExecuteError from './helpers/ExecuteError';

/**
 * Executes a command string.
 *
 * Quite simple in its current state and should be expected to change in the future.
 */
export default function execute(command, { silent, cwd, context, args } = {}) {
    return new Promise((resolve, reject) => {
        const cmd = getCommand(command, args);
        const child = spawnCommand(cmd, {
            stdio: silent ? undefined : 'inherit',
            env: getEnv(context),
            cwd,
        });

        child.on('exit', (exitCode) => {
            if (exitCode !== 0) {
                return reject(
                    new ExecuteError(`The command "${cmd}" failed with error code ${exitCode}`, cmd, exitCode),
                );
            }

            return resolve(exitCode);
        });

        child.on('error', (error) =>
            reject(error),
        );
    });
}
