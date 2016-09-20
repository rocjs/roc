import expect from 'expect';
import trimNewlines from 'trim-newlines';
import stripAnsi from 'strip-ansi';
import redent from 'redent';

import generateCommandsDocumentation from '../../../../src/cli/commands/documentation/generateCommandsDocumentation';

function trimRight(text) {
    return text.replace(/ +$/gm, '');
}

/* eslint-disable max-len */
describe('cli', () => {
    describe('commands', () => {
        describe('documentation', () => {
            describe('generateCommandsDocumentation', () => {
                it('should render a correctly formatted table when no commands', () => {
                    expect(trimRight(stripAnsi(generateCommandsDocumentation({}, 'roc')))).toEqual(
                        redent(trimNewlines(`
                            Usage: roc <command>

                            Commands:
                             No commands available.

                            General options:
                             -b, --better-feedback   Enables source-map-support and loud-rejection.
                             -c, --config            Path to configuration file.
                             -d, --directory         Path to working directory.
                             -h, --help              Output usage information.
                             -V, --verbose           Enable verbose mode.
                             -v, --version           Output version number.
                            `
                        ))
                    );
                });

                it('should render a correctly formatted table when commands', () => {
                    const commands = {
                        group: {
                            cmd1: {
                                command: () => {},
                                description: 'A description that describes command nr. 1',
                            },
                            cmd2: {
                                command: () => {},
                                description: 'A description that describes command nr. 2',
                            },
                            group2: {
                                __meta: {
                                    name: 'Group',
                                },
                                cmd3: {
                                    command: () => {},
                                    description: 'A description that describes command nr. 3',
                                },
                            },
                        },
                        cmd4: {
                            command: () => {},
                            description: 'A description that describes command nr. 4',
                        },
                    };

                    expect(trimRight(stripAnsi(generateCommandsDocumentation(commands, 'roc')))).toEqual(
                        redent(trimNewlines(`
                            Usage: roc <command>

                            Commands:
                             cmd4                   A description that describes command nr. 4

                            group:
                             group cmd1             A description that describes command nr. 1
                             group cmd2             A description that describes command nr. 2

                            Group:
                             group group2 cmd3      A description that describes command nr. 3

                            General options:
                             -b, --better-feedback  Enables source-map-support and loud-rejection.
                             -c, --config           Path to configuration file.
                             -d, --directory        Path to working directory.
                             -h, --help             Output usage information.
                             -V, --verbose          Enable verbose mode.
                             -v, --version          Output version number.
                            `
                        ))
                    );
                });
            });
        });
    });
});
