import merge from '../../helpers/merge';
import settingsToText from '../../documentation/text/settingsToText';
import generateDocumentation from '../../documentation/markdown/generateDocumentation';
import validRocProject from '../../helpers/validRocProject';
import { normalizeCommands } from '../extensions/helpers/processCommands';
import { registerHooks } from '../../hooks/manageHooks';
import isObject from '../../validation/validators/isObject';
import isFunction from '../../validation/validators/isFunction';

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
                validation: isFunction,
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
                    command: ({ extensionConfig, metaObject }) => {
                        console.log(settingsToText(extensionConfig, metaObject));
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
                            mode: rocCommandObject.parsedOptions.options.mode
                        }),
                    description: 'Generates documentation for the current project.',
                    options: [{
                        name: 'html',
                        default: false
                    }, {
                        name: 'mode',
                        default: 'github.com'
                    }, {
                        name: 'markdown',
                        default: true
                    }, {
                        name: 'output',
                        default: 'docs'
                    }, {
                        name: 'hide-commands'
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
