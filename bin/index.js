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
            options: [{
                name: 'list',
                shortname: 'l',
                validation: validators.isBoolean,
                description: 'List the available versions of a template.'
            }, {
                name: 'force',
                shortname: 'f',
                validation: validators.isBoolean,
                description: 'Ignore non empty directory warning.'
            }],
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
