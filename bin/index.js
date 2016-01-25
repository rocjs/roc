#! /usr/bin/env node

const runCli = require('../lib/cli').runCli;
const validators = require('../lib/validation/validators');

const init = require('../lib/commands/init');

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
            help: `
                Used to init new projects using special templates. If no template is given a prompt...
                The templates are fetched from Github and it's easy to create new ones.`,
            arguments: [{
                name: 'template',
                validation: validators.isPath,
                description: 'What template to use. Matches Github structure with Username/Repo.'
            }, {
                name: 'version',
                validation: validators.isString,
                description: 'What version to use.'
            }]
        }
    }
});
