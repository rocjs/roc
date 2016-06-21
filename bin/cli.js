const pkg = require('../package.json');
const runCli = require('../lib/cli/runCli').default;
const commands = require('../lib/commands').default;

runCli({
    info: {
        version: pkg.version,
        name: pkg.name
    },
    commands: commands
});
