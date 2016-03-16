import { isBoolean, isPath, isArray, isString } from '../../lib/validation/validators';
import { toArray } from '../../lib/convertors';
import init from '../../lib/commands/init';
import markdownCommands from '../../lib/commands/markdown-commands';

const { name } = require('../../package.json');

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
    description: 'The template to use. Matches Github structure with Username/Repo.'
}, {
    name: 'version',
    validation: isString,
    description: 'The version to use.'
}];

const roc = {
    name,
    config: {
        commands: {
            init,
            'new': init,
            'markdown-commands': ({
                packageConfig,
                metaObject,
                info,
                parsedArguments: { arguments: args },
                parsedOptions: { options }
            }) => {
                console.log(markdownCommands(
                    packageConfig,
                    metaObject,
                    info,
                    args,
                    options
                ));
            }
        }
    },
    meta: {
        commands: {
            'init': {
                description: 'Init a new project.',
                /* eslint-disable max-len */
                help: `
                    Used to init new projects using special templates. If no template is given a prompt will ask for one.
                    The templates are fetched from Github and it's easy to create new ones.`,
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
                    validation: isString,
                    description: 'Name for a new directory to create the project in.',
                    required: true
                }, initArguments)
            },
            'markdown-commands': {
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
                    convertor: toArray,
                    description: 'A list of commands that should be hidden form the generated markdown.'
                }]
            }
        }
    }
};

/**
 * Roc object
 *
 * @returns {rocObject} - The rocObject used by the base cli.
 */
export default roc;
