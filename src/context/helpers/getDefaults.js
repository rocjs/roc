import merge from '../../helpers/merge';
import settingsToText from '../../documentation/text/settingsToText';
import generateDocumentation from '../../documentation/markdown/generateDocumentation';
import validRocProject from '../../helpers/validRocProject';
import { normalizeCommands } from '../extensions/helpers/processCommands';
import { registerHooks } from '../../hooks/manageHooks';
import isObject from '../../validation/validators/isObject';
import isFunction from '../../validation/validators/isFunction';
import isBoolean from '../../validation/validators/isBoolean';

export default function getDefaults(context, name = 'roc', directory) {
    const newContext = merge(context, {
        config: getDefaultConfig(),
        meta: getDefaultMeta(),
        // If it is undefined the existing commands will be overwritten.
        commands: getDefaultCommands(directory) || {},
    });

    newContext.commands = normalizeCommands(name, newContext.commands);

    newContext.hooks = registerHooks(getDefaultHooks(), 'roc', newContext.hooks);

    return newContext;
}

function getDefaultHooks() {
    return {
        'update-settings': {
            description: `
            Expected to return new settings that should be merged with the existing ones.

            Makes it possible to modify the settings object before a command is started and after potential arguments from the command line and configuration file have been parsed. This is a good point to default to some value if no was given or modify something in the settings.`, // eslint-disable-line
            arguments: [{
                name: 'getSettings',
                validator: isFunction,
                description: 'A function that returns the settings after the context has been initialized.',
            }],
            returns: isObject(),
            hasCallback: true,
        },
    };
}

function getDefaultCommands(directory) {
    if (directory === undefined || validRocProject(directory)) {
        return {
            meta: {
                __meta: {
                    name: 'Meta commands',
                    description: 'Meta commands that can be used to generate meta data about the current project.',
                },
                'list-settings': {
                    command: ({ context: { extensionConfig, meta } }) => {
                        // eslint-disable-next-line
                        console.log(settingsToText(extensionConfig, meta));
                    },
                    description: 'Prints all the available settings that can be changed.',
                },
                docs: {
                    command: (rocCommandObject) =>
                        generateDocumentation({
                            rocCommandObject,
                            directory: rocCommandObject.options.managed.output,
                            html: rocCommandObject.options.managed.html,
                            markdown: rocCommandObject.options.managed.markdown,
                            mode: rocCommandObject.options.managed.mode,
                            project: rocCommandObject.options.managed.project,
                        }),
                    description: 'Generates documentation for the current project.',
                    options: [{
                        name: 'html',
                        default: false,
                        description: 'If HTML should be generated. (Not supported yet)',
                        validator: isBoolean,
                    }, {
                        name: 'mode',
                        default: 'github.com',
                        description: 'The platform that is to be used, for link generation.',
                        validator: /github\.com|nodejs\.org|bitbucket\.org|ghost\.org|gitlab\.com/,
                    }, {
                        name: 'markdown',
                        default: true,
                        description: 'If markdown should be generated.',
                        validator: isBoolean,
                    }, {
                        name: 'output',
                        default: 'docs',
                        description: 'A directory to place the generated documentation inside of.',
                        validator: isBoolean,
                    }, {
                        name: 'project',
                        default: false,
                        description: 'If the projects configuration and actions should be included.',
                        validator: isBoolean,
                    }],
                },
            },
        };
    }

    return undefined;
}

function getDefaultConfig() {
    return {
        settings: {},

        project: {
            actions: undefined,

            init: undefined,
        },
    };
}

function getDefaultMeta() {
    return {};
}
