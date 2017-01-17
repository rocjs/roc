import executeSync from './executeSync';

/**
 * Will automatically close the node process if a command in executeSync had a non zero status code
 * without throwing an exception.
 *
 * This can be useful for when the command that is running is handling the error output itself.
 */
export default function executeSyncExit(command, options) {
    try {
        return executeSync(command, options);
    } catch (error) {
        // Only process if we got an error that have getCode
        if (!error.getExitCode) {
            throw error;
        }

        return process.exit(error.getExitCode()); // eslint-disable-line
    }
}
