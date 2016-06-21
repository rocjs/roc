import settingsToText from '../documentation/text/settingsToText';
import generateDocumentation from '../documentation/markdown/generateDocumentation';
import validRocProject from '../helpers/validRocProject';

export function getDefaultCommands(directory, override = false) {
    if (override || validRocProject(directory)) {
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

export function getDefaultConfig() {
    return {
        settings: {},

        actions: undefined
    };
}

export function getDefaultMeta() {
    return {};
}
