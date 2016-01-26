import expect from 'expect';

import { consoleMockWrapper } from '../utils';

import { runCli } from '../../src/cli';

describe('roc', () => {
    describe('cli', () => {
        describe('runCli', () => {
            const spy = expect.createSpy();

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

            it('should return version when requested', () => {
                return consoleMockWrapper((log) => {
                    runCli({version: '1.0.1'}, {}, {}, ['node', '/some/path', '-v']);
                    expect(log.calls[0].arguments[0]).toBe('1.0.1');
                    runCli({version: '1.0.1'}, {}, {}, ['node', '/some/path', '--version']);
                    expect(log.calls[1].arguments[0]).toBe('1.0.1');
                    runCli(undefined, {}, {}, ['node', '/some/path', '--version']);
                    expect(log.calls[2].arguments[0]).toBe('Unknown');
                });
            });

            it('should show general information if no command or version is given', () => {
                return consoleMockWrapper((log) => {
                    runCli({version: '1.0.1', name: 'roc-test' }, {}, {}, ['node', '/some/path']);
                    expect(log.calls[0].arguments[0]).toInclude('No commands available.');
                });
            });

            it('should show information if command is invalid', () => {
                return consoleMockWrapper((log) => {
                    runCli({version: '1.0.1', name: 'roc-test' }, config, {},
                        ['node', '/some/path', 'command']);
                    expect(log.calls[1].arguments[0]).toInclude('Did not understand');
                });
            });

            it('should show help info when requested', () => {
                return consoleMockWrapper((log) => {
                    runCli({version: '1.0.1', name: 'roc-test' }, config, {},
                        ['node', '/some/path', 'test', '-h']);
                    expect(log.calls[0].arguments[0]).toInclude('Usage: roc-test test');
                });
            });

            it('should call command function', () => {
                return consoleMockWrapper(() => {
                    const info = {version: '1.0.1', name: 'roc-test' };
                    runCli(info, config, meta,
                        ['node', '/some/path', 'test']);

                    expect(spy.calls[0].arguments[0]).toEqual({
                        debug: false,
                        info: info,
                        configObject: config,
                        extensionConfig: config,
                        metaObject: meta,
                        parsedArguments: { arguments: { artifact: undefined }, rest: [] },
                        parsedOptions: { options: { list: undefined }, rest: {} }
                    });
                });
            });

            it('should call relay debug option', () => {
                return consoleMockWrapper(() => {
                    const info = {version: '1.0.1', name: 'roc-test' };
                    runCli(info, config, meta,
                        ['node', '/some/path', 'test', '--debug']);

                    expect(spy.calls[0].arguments[0]).toEqual({
                        debug: true,
                        info: info,
                        configObject: config,
                        extensionConfig: config,
                        metaObject: meta,
                        parsedArguments: { arguments: { artifact: undefined }, rest: [] },
                        parsedOptions: { options: { list: undefined }, rest: {} }
                    });
                });
            });

            it('should parse argument', () => {
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
                        debug: false,
                        info: info,
                        configObject: newConfig,
                        extensionConfig: config,
                        metaObject: meta,
                        parsedArguments: { arguments: { artifact: undefined }, rest: [] },
                        parsedOptions: { options: { list: undefined }, rest: {} }
                    });
                });
            });
        });
    });
});
