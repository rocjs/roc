import executeSync from './executeSync';

/**
 * Will automatically close the node process if a command in executeSync had a non zero status code
 * without throwing an exception.
 *
 * This can be useful for when the command that is running is handling the error output itself.
 *
 * @param {string} command - A command string that should run.
 */
export default function executeSyncExit(command) {
    try {
        executeSync(command);
    } catch (err) {
        // Only process if we got the error from below that sets the exitStatus.
        if (!err.exitStatus) {
            throw err;
        }

        process.exit(err.exitStatus); // eslint-disable-line
    }
}
