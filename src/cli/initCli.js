import runCli from './runCli';

/**
 * Small helper for convenience to init the Roc cli, wraps {@link runCli}.
 *
 * Will enable source map support and better error handling for promises.
 *
 * @param {string} version - The version to be used when requested for information.
 * @param {string} name - The name to be used when display feedback to the user.
 *
 * @returns {object} - Returns what the command is returning. If the command is a string command a promise will be
 *  returned that is resolved when the command has been completed.
 */
export default function initCli(version, name) {
    require('source-map-support').install();
    require('loud-rejection')();

    return runCli({
        info: {
            version: version,
            name: name
        }
    });
}
