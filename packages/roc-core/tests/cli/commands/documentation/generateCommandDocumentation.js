import expect from 'expect';

import trimNewlines from 'trim-newlines';
import stripAnsi from 'strip-ansi';
import redent from 'redent';
import { isString, isBoolean } from 'roc-validators';
import { toString, toBoolean } from 'roc-converters';

import generateCommandDocumentation from '../../../../src/cli/commands/documentation/generateCommandDocumentation';

function trimRight(text) {
    return text.replace(/ +$/gm, '');
}

/* eslint-disable max-len */
describe('cli', () => {
    describe('commands', () => {
        describe('documentation', () => {
            describe('generateCommandDocumentation', () => {
                const settings = {
                    group: {
                        value: 'Roc',
                    },
                    anotherGroup: {
                        subGroup: {
                            value: true,
                        },
                    },
                };

                const metaSettings = {
                    group: {
                        __meta: {
                            description: 'A group description.',
                        },
                        value: {
                            validator: isString,
                            description: 'A string that does things!',
                        },
                    },
                    anotherGroup: {
                        subGroup: {
                            value: {
                                validator: isBoolean,
                                description: 'A boolean that does things!',
                            },
                        },
                    },
                };

                const commands = {
                    cmd: {
                        command: () => {},
                        description: 'A description that describes the command',
                        settings: true,
                        arguments: [{
                            default: 'Hello World',
                            name: 'arg1',
                            description: 'Argument 1',
                            validator: isString,
                            converter: toString,
                        }],
                        options: [{
                            alias: 'f',
                            converter: toBoolean,
                            default: false,
                            description: 'If something should be enabled or not',
                            name: 'feature',
                            validator: isBoolean,
                        }],
                    },
                };

                it('should render a correctly formatted table for a command', () => {
                    expect(trimRight(stripAnsi(generateCommandDocumentation(settings, metaSettings, commands, 'cmd', 'roc', []))))
                        .toEqual(redent(trimNewlines(`
                            Usage: roc cmd [arg1]

                            A description that describes the command

                            Arguments:
                             arg1                           Argument 1  "Hello World"

                            Command options:
                             -f, --feature                  If something should be enabled or not  false

                            Settings options:
                            anotherGroup:
                             --anotherGroup-subGroup-value  A boolean that does things!  true

                            group:
                            A group description.

                             --group-value                  A string that does things!  "Roc"    Can not be empty

                            General options:
                             -b, --better-feedback          Enables source-map-support and loud-rejection.
                             -c, --config                   Path to configuration file.
                             -d, --directory                Path to working directory.
                             -h, --help                     Output usage information.
                             -V, --verbose                  Enable verbose mode.
                             -v, --version                  Output version number.
                            `,
                        )),
                    );
                });

                it('should render a correctly formatted table for a command with help text', () => {
                    expect(trimRight(stripAnsi(generateCommandDocumentation({}, {}, {
                        cmd: {
                            ...commands.cmd,
                            help: 'A help text for the command, longer than the description.',
                        },
                    }, 'cmd', 'roc', []))))
                        .toEqual(redent(trimNewlines(`
                            Usage: roc cmd [arg1]

                            A help text for the command, longer than the description.

                            Arguments:
                             arg1                   Argument 1  "Hello World"

                            Command options:
                             -f, --feature          If something should be enabled or not  false

                            Settings options:
                            General options:
                             -b, --better-feedback  Enables source-map-support and loud-rejection.
                             -c, --config           Path to configuration file.
                             -d, --directory        Path to working directory.
                             -h, --help             Output usage information.
                             -V, --verbose          Enable verbose mode.
                             -v, --version          Output version number.
                            `,
                        )),
                    );
                });
            });
        });
    });
});
