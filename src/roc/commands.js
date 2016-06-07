import { isBoolean, isPath, isArray, isString } from '../validation/validators';
import { toArray } from '../converters';
import init from '../commands/init';
import markdownCommands from '../commands/markdown-commands';

const initOptions = [{
    name: 'list',
    shortname: 'l',
    validation: isBoolean,
    description: 'List the available versions of a template.'
}, {
    name: 'force',
    shortname: 'f',
    validation: isBoolean,
    description: 'Ignore non empty directory warning.'
}];

const initArguments = [{
    name: 'template',
    validation: isPath,
    description: 'The template to use. Matches Github structure with Username/Repo or a local zip file.'
}, {
    name: 'version',
    validation: isString,
    description: 'The version to use.'
}];

export default {
    create: {
        __meta: {
            name: 'Project creation',
            description: 'Commands that can be used to create new projects.'
        },
        init: {
            command: init,
            description: 'Init a new project.',
            /* eslint-disable max-len */
            help: `
                Used to init new projects using special templates. If no template is given a prompt will ask for one.
                The templates are fetched from Github and it's easy to create new ones.`,
            markdown: `
                The __init__ command can be used to initiate a new Roc project and currently expects that it's run inside an empty directory. As can be seen above it takes two optional arguments, template and version. If no template is given a prompt will be shown with the possible alternatives that exists. Currently these alternatives are coded into Roc and matches \`web-app\` and \`web-app-react\`.

                __template__
                Template can either be a short name for a specific template, currently it accepts \`web-app\` and \`web-app-react\` that will be converted internally to \`rocjs/roc-template-web-app\` and \`rocjs/roc-template-web-app-react\`. As can be seen here the actual template reference is a Github repo and can be anything matching that pattern \`USERNAME/PROJECT\`.

                The template can also point to a local zip file (ending in \`.zip\`) of a template repository. This is useful if the template is on a private repo or not on GitHub.

                It will also expect that the template has a folder named \`template\` and that inside of it there is \`package.json\` file with at least one dependency to a Roc module following the pattern \`roc-package-*\` or that it has a \`roc.config.js\` file (this file is then expected to have some [packages](/docs/config/packages.md) defined but this is not checked immediately).

                __version__
                Versions should match a tag on the Github repo and will default to master if none exists. When giving an input on the command line Roc will automatically add \`v\` in front of versions that starts with a number to match Github default that have versions tags that start with \`v\` like \`v1.0.0\`. \`master\` is also always available as an option.`,
            /* eslint-enable */
            options: initOptions,
            arguments: initArguments
        },
        new: {
            command: init,
            description: 'Create a new project.',
            help: `
                Alias for "init" that always will try to create a new directory.`,
            options: initOptions,
            arguments: [].concat({
                name: 'name',
                validation: isString,
                description: 'Name for a new directory to create the project in.',
                required: true
            }, initArguments)
        }
    },
    meta: {
        __meta: {
            name: 'Meta commands',
            description: 'Meta commands that can be used to generate meta data about the current project.'
        },
        'markdown-commands': {
            command: ({
                packageConfig,
                metaObject,
                info: { name: cliName },
                parsedArguments: { arguments: { 'settings-link': settingsLink } },
                parsedOptions: { options: { 'hide-commands': hideCommands } }
            }) => {
                console.log(markdownCommands(
                    cliName,
                    packageConfig,
                    metaObject,
                    settingsLink,
                    hideCommands
                ));
            },
            description: 'Create markdown documentation for the commands.',
            arguments: [{
                name: 'settings-link',
                validation: isString,
                description: 'A link that should be used when generation to link to the settings location.'
            }],
            options: [{
                name: 'hide-commands',
                default: [],
                validation: isArray(isString),
                converter: toArray(),
                description: 'A list of commands that should be hidden form the generated markdown.'
            }]
        }
    }
};
