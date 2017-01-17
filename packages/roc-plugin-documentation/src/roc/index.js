import { isBoolean, isString, notEmpty } from 'roc-validators';

export default {
    postInit: ({ context: { inValidProject } }) => {
        if (inValidProject) {
            return {
                roc: {
                    commands: {
                        meta: {
                            __meta: {
                                name: 'Meta commands',
                                description: 'Meta commands that can be used to generate meta data about the current ' +
                                    'project.',
                            },
                            'list-settings': {
                                command: ({ context: { extensionConfig, meta } }) => {
                                    // eslint-disable-next-line
                                    const settingsToText = require('../commands/text/settingsToText').default;
                                    // eslint-disable-next-line
                                    console.log(settingsToText(extensionConfig, meta));
                                },
                                description: 'Prints all the available settings that can be changed.',
                            },
                            docs: {
                                command: (commandObject) => {
                                    const generateDocumentation =
                                        require('../commands/markdown/generateDocumentation').default;

                                    return generateDocumentation({
                                        commandObject,
                                        directory: commandObject.options.managed.output,
                                        html: commandObject.options.managed.html,
                                        markdown: commandObject.options.managed.markdown,
                                        mode: commandObject.options.managed.mode,
                                        project: commandObject.options.managed.project,
                                    });
                                },
                                description: 'Generates documentation for the current project.',
                                options: {
                                    html: {
                                        default: false,
                                        description: 'If HTML should be generated. (Not supported yet)',
                                        validator: isBoolean,
                                    },
                                    mode: {
                                        default: 'github.com',
                                        description: 'The platform that is to be used, for link generation.',
                                        validator: /github\.com|nodejs\.org|bitbucket\.org|ghost\.org|gitlab\.com/,
                                    },
                                    markdown: {
                                        default: true,
                                        description: 'If markdown should be generated.',
                                        validator: isBoolean,
                                    },
                                    output: {
                                        default: 'docs',
                                        description: 'A directory to place the generated documentation inside of.',
                                        validator: notEmpty(isString),
                                    },
                                    project: {
                                        default: false,
                                        description: 'If the projects configuration and actions should be included.',
                                        validator: isBoolean,
                                    },
                                },
                            },
                        },
                    },
                },
            };
        }

        return undefined;
    },
};
