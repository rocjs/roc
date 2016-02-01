#! /usr/bin/env node

const runCli = require('../lib/cli').runCli;
const validators = require('../lib/validation/validators');

const init = require('../lib/commands/init').default;
const markdownCommands = require('../lib/commands/markdown-commands').default;

const pkg = require('../package.json');

const initOptions = [{
    name: 'list',
    shortname: 'l',
    validation: validators.isBoolean,
    description: 'List the available versions of a template.'
}, {
    name: 'force',
    shortname: 'f',
    validation: validators.isBoolean,
    description: 'Ignore non empty directory warning.'
}];

const initArguments = [{
    name: 'template',
    validation: validators.isPath,
    description: 'The template to use. Matches Github structure with Username/Repo.'
}, {
    name: 'version',
    validation: validators.isString,
    description: 'The version to use.'
}];

runCli({
    version: pkg.version,
    name: pkg.name
}, {
    commands: {
        init,
        'new': init,
        'markdown-commands': (rocCommandObject) => {
            console.log(markdownCommands(
                rocCommandObject.extensionConfig,
                rocCommandObject.metaObject,
                rocCommandObject.info,
                rocCommandObject.parsedArguments.arguments
            ));
        }
    }
}, {
    commands: {
        'init': {
            description: 'Init a new project.',
            help: `
                Used to init new projects using special templates. If no template is given a prompt will ask for one.
                The templates are fetched from Github and it's easy to create new ones.`,
            /* eslint-disable max-len */
            markdown: `
                The __init__ command can be used to initiate a new Roc project and currently expects that it's run inside an empty directory. As can be seen above it takes two optional arguments, template and version. If no template is given a prompt will be shown with the possible alternatives that exists. Currently these alternatives are coded into Roc and matches \`web\` and \`web-react\`.`,
            /* eslint-enable */
            options: initOptions,
            arguments: initArguments
        },
        'new': {
            description: 'Create a new project.',
            help: `
                Alias for "init" that always will try to create a new directory.`,
            options: initOptions,
            arguments: [].concat({
                name: 'name',
                validation: validators.isString,
                description: 'Name for a new directory to create the project in.',
                required: true
            }, initArguments)
        },
        'markdown-commands': {
            description: 'Create markdown documentation for the commands.',
            arguments: [{
                name: 'settings-link',
                validation: validators.isString,
                description: 'A link that should be used when generation to link to the settings location.'
            }]
        }
    }
});
