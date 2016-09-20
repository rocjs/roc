const packageJSON = require('../package.json');
const runCli = require('../lib/cli/runCli').default;
const commands = require('../lib/commands').default;

runCli({
    info: {
        version: packageJSON.version,
        name: packageJSON.name,
    },
    commands,
});
