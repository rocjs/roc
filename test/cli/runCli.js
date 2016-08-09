import expect from 'expect';

import { consoleMockWrapper } from '../utils';

import runCli from '../../src/cli/runCli';

describe('roc', () => {
    describe('cli', () => {
        describe('runCli', () => {
            const spy = expect.createSpy();

            const commands = {
                test: spy
            };

            const config = {
                settings: {
                    group1: {
                        port: 80
                    }
                },
                commands: {
                    test: spy
                }
            };

            const meta = {
                commands: {
                    test: {
                        settings: true,
                        arguments: [{
                            name: 'artifact'
                        }],
                        options: [{
                            name: 'list'
                        }]
                    }
                }
            };

            afterEach(() => {
                spy.calls = [];
            });
/*
export default function runCli({
    info = { version: 'Unknown', name: 'Unknown' },
    commands: initalCommands,
    argv = process.argv,
    invoke = true,
}) {
*/
            it('should return version when requested', () => {
                return consoleMockWrapper((log) => {
                    runCli({
                        info: {version: '1.0.1'},
                        argv: ['node', '/some/path', '-v']
                    });
                    expect(log.calls[0].arguments[0]).toBe('1.0.1');
                    runCli({
                        info: {version: '1.0.1'},
                        argv: ['node', '/some/path', '--version']
                    });
                    expect(log.calls[1].arguments[0]).toBe('1.0.1');
                    runCli({
                        argv: ['node', '/some/path', '--version']
                    });
                    expect(log.calls[2].arguments[0]).toBe('Unknown');
                });
            });

            xit('should show general information if no command or version is given', () => {
                return consoleMockWrapper((log) => {
                    runCli({
                        info: {version: '1.0.1'},
                        argv: ['node', '/some/path']
                    });
                    expect(log.calls[0].arguments[0]).toInclude('No commands available.');
                });
            });

            xit('should show information if command is invalid', () => {
                return consoleMockWrapper((log) => {
                    runCli({
                        info: { version: '1.0.1', name: 'roc-test' },
                        commands,
                        argv: ['node', '/some/path', 'command']
                    });
                    expect(log.calls[0].arguments[0]).toInclude('Did not understand');
                });
            });

            it('should show help info when requested', () => {
                return consoleMockWrapper((log) => {
                    runCli({
                        info: { version: '1.0.1', name: 'roc-test' },
                        commands,
                        argv: ['node', '/some/path', 'test', '-h']
                    });
                    expect(log.calls[0].arguments[0]).toInclude('Usage: roc-test test');
                });
            });

            xit('should call command function', () => {
                return consoleMockWrapper(() => {
                    const info = {version: '1.0.1', name: 'roc-test' };
                    runCli(info, config, meta,
                        ['node', '/some/path', 'test']);

                    expect(spy.calls[0].arguments[0]).toEqual({
                        verbose: false,
                        directory: undefined,
                        info: info,
                        configObject: config,
                        packageConfig: config,
                        metaObject: meta,
                        parsedArguments: { arguments: { artifact: undefined }, rest: [] },
                        parsedOptions: { options: { list: undefined }, rest: {} },
                        hooks: {},
                        actions: []
                    });
                });
            });

            xit('should call relay debug option', () => {
                return consoleMockWrapper(() => {
                    const info = {version: '1.0.1', name: 'roc-test' };
                    runCli(info, config, meta,
                        ['node', '/some/path', 'test', '--verbose']);

                    expect(spy.calls[0].arguments[0]).toEqual({
                        verbose: true,
                        directory: undefined,
                        info: info,
                        configObject: config,
                        packageConfig: config,
                        metaObject: meta,
                        parsedArguments: { arguments: { artifact: undefined }, rest: [] },
                        parsedOptions: { options: { list: undefined }, rest: {} },
                        hooks: {},
                        actions: []
                    });
                });
            });

            xit('should parse argument', () => {
                return consoleMockWrapper(() => {
                    const info = {version: '1.0.1', name: 'roc-test' };
                    runCli(info, config, meta,
                        ['node', '/some/path', 'test', '--group1-port=8080']);

                    const newConfig = {
                        ...config,
                        settings: {
                            ...config.settings,
                            group1: {
                                port: 8080
                            }
                        }
                    };

                    expect(spy.calls[0].arguments[0]).toEqual({
                        verbose: false,
                        directory: undefined,
                        info: info,
                        configObject: newConfig,
                        packageConfig: config,
                        metaObject: meta,
                        parsedArguments: { arguments: { artifact: undefined }, rest: [] },
                        parsedOptions: { options: { list: undefined }, rest: {} },
                        hooks: {},
                        actions: []
                    });
                });
            });
        });
    });
});
