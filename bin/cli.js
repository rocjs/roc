const pkg = require('../package.json');
const runCli = require('../lib/cli').runCli;
const commands = require('../lib/roc/commands').default;

runCli({
    info: {
        version: pkg.version,
        name: pkg.name
    },
    commands: commands
});
