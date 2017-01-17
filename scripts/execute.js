const spawnCommand = require('spawn-command'); // eslint-disable-line

module.exports = function execute(command, { silent, cwd } = {}) {
    return new Promise((resolve, reject) => {
        const cmd = command;
        const child = spawnCommand(cmd, {
            stdio: silent ? undefined : 'inherit',
            cwd,
        });

        child.on('exit', (exitCode) => {
            if (exitCode !== 0) {
                return reject(new Error(`The command "${cmd}" failed with error code ${exitCode}`, cmd, exitCode));
            }

            return resolve(exitCode);
        });

        child.on('error', (error) => reject(error));
    });
};
