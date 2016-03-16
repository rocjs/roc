import expect from 'expect';
import redent from 'redent';
import trimNewlines from 'trim-newlines';


import markdownCommands from '../../src/commands/markdown-commands';

const mockConfig = {
    settings: {
        group1: 1,
        group2: 2
    },
    commands: {
        b: '',
        c: '',
        a: ''
    }
};

const mockMetaConfig = {
    commands: {
        b: {
            markdown: 'Some markdown documentation',
            arguments: [{
                name: 'test'
            }],
            options: [{
                name: 'list',
                shortname: 'l',
                required: true
            }],
            settings: ['group1']
        },
        a: {
            description: 'A description',
            help: 'A helpt text',
            settings: true
        }
    }
};

describe('roc', () => {
    describe('commands', () => {
        describe('markdown-commands', () => {
            it('should correctly generate documentation for available commands', () => {
                expect(markdownCommands(mockConfig, mockMetaConfig, {
                    name: 'roc-test'
                }, {}, {'hide-commands': []}))
                    /* eslint-disable max-len */
                    .toEqual(redent(trimNewlines(`
                        # Commands for \`roc-test\`

                        ## General Information
                        All commands can be called with some additional options as can be seen below.

                        ### General options

                        | Name            | Description                                                                                                   | Required |
                        | --------------- | ------------------------------------------------------------------------------------------------------------- | -------- |
                        | -c, --config    | Path to configuration file, will default to roc.config.js in current working directory.                       | No       |
                        | -d, --directory | Path to working directory, will default to the current working directory. Can be either absolute or relative. | No       |
                        | -h, --help      | Output usage information.                                                                                     | No       |
                        | -V, --verbose   | Enable verbose mode.                                                                                          | No       |
                        | -v, --version   | Output version number.                                                                                        | No       |

                        ## Commands
                        * [a](#a)
                        * [b](#b)
                        * [c](#c)

                        ## a
                        __A description__

                        \`\`\`
                        roc-test a
                        \`\`\`
                        A helpt text

                        ### Settings options
                        _All groups are available._
                        * group1
                        * group2

                        ## b

                        \`\`\`
                        roc-test b [test]
                        \`\`\`
                        Some markdown documentation

                        ### Arguments

                        | Name       | Description | Required | Type | Default |
                        | ---------- | ----------- | -------- | ---- | ------- |
                        | test       |             | No       |      |         |

                        ### Command options

                        | Name       | Description | Required | Type | Default |
                        | ---------- | ----------- | -------- | ---- | ------- |
                        | -l, --list |             | Yes      |      |         |

                        ### Settings options
                        * group1

                        ## c

                        \`\`\`
                        roc-test c
                        \`\`\`
                        `)));
                    /* eslint-enable*/
            });

            it('should correctly generate documentation for available commands with settings links', () => {
                expect(markdownCommands(mockConfig, mockMetaConfig, {
                    name: 'roc-test'
                }, {'settings-link': '/docs/Settings.md'}, {'hide-commands': []}))
                    /* eslint-disable max-len */
                    .toEqual(redent(trimNewlines(`
                        # Commands for \`roc-test\`

                        ## General Information
                        All commands can be called with some additional options as can be seen below.

                        ### General options

                        | Name            | Description                                                                                                   | Required |
                        | --------------- | ------------------------------------------------------------------------------------------------------------- | -------- |
                        | -c, --config    | Path to configuration file, will default to roc.config.js in current working directory.                       | No       |
                        | -d, --directory | Path to working directory, will default to the current working directory. Can be either absolute or relative. | No       |
                        | -h, --help      | Output usage information.                                                                                     | No       |
                        | -V, --verbose   | Enable verbose mode.                                                                                          | No       |
                        | -v, --version   | Output version number.                                                                                        | No       |

                        ## Commands
                        * [a](#a)
                        * [b](#b)
                        * [c](#c)

                        ## a
                        __A description__

                        \`\`\`
                        roc-test a
                        \`\`\`
                        A helpt text

                        ### Settings options
                        _All groups are available._
                        * [group1](/docs/Settings.md#group1)
                        * [group2](/docs/Settings.md#group2)

                        ## b

                        \`\`\`
                        roc-test b [test]
                        \`\`\`
                        Some markdown documentation

                        ### Arguments

                        | Name       | Description | Required | Type | Default |
                        | ---------- | ----------- | -------- | ---- | ------- |
                        | test       |             | No       |      |         |

                        ### Command options

                        | Name       | Description | Required | Type | Default |
                        | ---------- | ----------- | -------- | ---- | ------- |
                        | -l, --list |             | Yes      |      |         |

                        ### Settings options
                        * [group1](/docs/Settings.md#group1)

                        ## c

                        \`\`\`
                        roc-test c
                        \`\`\`
                        `)));
                    /* eslint-enable*/
            });
        });
    });
});
