#! /usr/bin/env node

const runCli = require('../lib/cli').runCli;
const validators = require('../lib/validation/validators');

const init = require('../lib/bin/commands/init');

const pkg = require('../package.json');

runCli({
    version: pkg.version,
    name: pkg.name
}, {
    commands: {
        init
    }
}, {
    commands: {
        init: {
            description: 'Init a new project.',
            options: [{
                name: 'template',
                validation: validators.isPath
            }, {
                name: 'version',
                validation: validators.isString
            }]
        }
    }
});
