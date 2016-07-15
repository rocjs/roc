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
        commands: getDefaultCommands(directory) || {}
    });

    newContext.commands = normalizeCommands(name, newContext.commands);

    newContext.hooks = registerHooks(getDefaultHooks(), 'roc', newContext.hooks);

    return newContext;
}

function getDefaultHooks() {
    return {
        'update-settings': {
            description: 'Expected to return new settings that should be merged with the existing ones.',
            arguments: [{
                name: 'getSettings',
                validator: isFunction,
                description: 'A function that returns the settings after the context has been initialized.'
            }],
            returns: isObject(),
            hasCallback: true
        }
    };
}

function getDefaultCommands(directory) {
    if (directory === undefined || validRocProject(directory)) {
        return {
            meta: {
                '__meta': {
                    name: 'Meta commands',
                    description: 'Meta commands that can be used to generate meta data about the current project.'
                },
                'list-settings': {
                    command: ({ context: { extensionConfig, meta }}) => {
                        console.log(settingsToText(extensionConfig, meta));
                    },
                    description: 'Prints all the available settings that can be changed.'
                },
                'docs': {
                    command: (rocCommandObject) =>
                        generateDocumentation({
                            rocCommandObject,
                            directory: rocCommandObject.parsedOptions.options.output,
                            html: rocCommandObject.parsedOptions.options.html,
                            markdown: rocCommandObject.parsedOptions.options.markdown,
                            mode: rocCommandObject.parsedOptions.options.mode,
                            project: rocCommandObject.parsedOptions.options.project
                        }),
                    description: 'Generates documentation for the current project.',
                    options: [{
                        name: 'html',
                        default: false,
                        description: 'If HTML should be generated. (Not supported yet)',
                        validator: isBoolean
                    }, {
                        name: 'mode',
                        default: 'github.com',
                        description: 'The platform that is to be used, for link generation.',
                        validator: /github\.com|nodejs\.org|bitbucket\.org|ghost\.org|gitlab\.com/
                    }, {
                        name: 'markdown',
                        default: true,
                        description: 'If markdown should be generated.',
                        validator: isBoolean
                    }, {
                        name: 'output',
                        default: 'docs',
                        description: 'A directory to place the generated documentation inside of.',
                        validator: isBoolean
                    }, {
                        name: 'project',
                        default: false,
                        description: 'If the projects configuration and actions should be included.',
                        validator: isBoolean
                    }]
                }
            }
        };
    }
}

function getDefaultConfig() {
    return {
        settings: {},

        actions: undefined,

        init: undefined
    };
}

function getDefaultMeta() {
    return {};
}
