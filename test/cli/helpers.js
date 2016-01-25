import expect from 'expect';
import stripAnsi from 'strip-ansi';
import { join } from 'path';

import { consoleMockWrapper } from '../utils';

import { isString } from '../../src/validation/validators';
import {
    buildCompleteConfig,
    getSuggestions,
    getMappings,
    parseOptions,
    parseArguments,
    generateCommandsDocumentation,
    generateCommandDocumentation
} from '../../src/cli/helpers';

import { complexDocumentObject } from '../documentation/data/documentation-object';

describe('roc', () => {
    describe('cli helpers', () => {
        describe('buildCompleteConfig', () => {
            let resolveSync;

            beforeEach(() => {
                resolveSync = expect.spyOn(require('resolve'), 'sync')
                    .andReturn(join(__dirname, 'data', 'mock-extension.js'));
            });

            afterEach(() => {
                resolveSync.calls = [];
                resolveSync.restore();
            });

            it('should correctly build configuration objects', () => {
                return consoleMockWrapper((log) => {
                    const result = buildCompleteConfig(true, {}, {}, {settings: {}, mismatch: {}}, {settings: {}},
                        join(__dirname, 'data', 'valid'), true);

                    expect(log.calls[0].arguments[0]).toInclude('following Roc extensions will be');
                    expect(result).toEqual({
                        extensionConfig: {settings: {}},
                        config: {settings: {}, mismatch: {}},
                        meta: {settings: {}}
                    });
                });
            });
        });

        describe('parseOptions', () => {
            let exit;

            beforeEach(() => {
                exit = expect.spyOn(process, 'exit').andCall(() => {
                    throw new Error('process exit called');
                });
            });

            afterEach(() => {
                exit.calls = [];
                exit.restore();
            });

            it('should tell the user that a required option is missing', () => {
                return consoleMockWrapper(() => {
                    expect(parseOptions).withArgs({
                    }, {}, {
                        options: [{
                            name: 'list',
                            required: true
                        }]
                    }).toThrow();
                });
            });

            it('should correctly map the options', () => {
                return consoleMockWrapper(() => {
                    expect(parseOptions({
                        list: 'hello',
                        t: true
                    }, {}, {
                        options: [{
                            name: 'list',
                            required: true
                        }, {
                            name: 'test',
                            shortname: 't',
                            required: true
                        }]
                    })).toEqual({
                        configuration: {},
                        parsedOptions: {
                            options: { list: 'hello', test: true },
                            rest: {}
                        }
                    });
                });
            });

            it('should correctly validate the options', () => {
                return consoleMockWrapper(() => {
                    expect(parseOptions).withArgs({
                        list: 123
                    }, {}, {
                        options: [{
                            name: 'list',
                            validation: isString,
                            required: true
                        }]
                    }).toThrow();
                });
            });
        });

        describe('parseArguments', () => {
            let exit;

            beforeEach(() => {
                exit = expect.spyOn(process, 'exit').andCall(() => {
                    throw new Error('process exit called');
                });
            });

            afterEach(() => {
                exit.calls = [];
                exit.restore();
            });

            it('should tell the user that a required argument is missing', () => {
                return consoleMockWrapper(() => {
                    expect(parseArguments).withArgs('test', {
                        test: {
                            arguments: [{
                                name: 'version',
                                required: true
                            }]
                        }
                    }, []).toThrow();
                });
            });

            it('should correctly map the options', () => {
                return consoleMockWrapper(() => {
                    expect(parseArguments('test', {
                        test: {
                            arguments: [{
                                name: 'version',
                                validation: isString,
                                required: true
                            }]
                        }
                    }, ['value'])).toEqual({
                        arguments: { version: 'value' },
                        rest: []
                    });
                });
            });

            it('should correctly validate the arguments', () => {
                return consoleMockWrapper(() => {
                    expect(parseArguments).withArgs('test', {
                        test: {
                            arguments: [{
                                name: 'version',
                                validation: isString,
                                required: true
                            }]
                        }
                    }, [123]).toThrow();
                });
            });
        });

        describe('generateCommandsDocumentation', () => {
            it('should correctly output documentation', () => {
                expect(stripAnsi(generateCommandsDocumentation({
                    commands: {
                        test: () => {},
                        help: () => {}
                    }
                }, {
                    commands: {
                        test: {
                            description: 'This command will do awesome stuff!',
                            arguments: [{
                                name: 'version'
                            }],
                            options: [{
                                name: 'list'
                            }]
                        }
                    }
                })).replace(/ +$/gm, '')).toEqual((
                    /* eslint-disable max-len */
`Commands:
 test [version]   This command will do awesome stuff!
 help

General options:
 -h, --help       Output usage information.
 -v, --version    Output version number.
 -d, --debug      Enable debug mode.
 -c, --config     Path to configuration file, will default to roc.config.js in current working directory.
 -D, --directory  Path to working directory, will default to the current working directory. Can be either absolute or relative.
`
                    /* eslint-enable */
                ));
            });
        });

        describe('generateCommandDocumentation', () => {
            it('should correctly output documentation', () => {
                expect(stripAnsi(generateCommandDocumentation({
                    settings: {
                        runtime: {
                            port: 8080
                        }
                    }
                }, {
                    commands: {
                        test: {
                            description: 'This command will do awesome stuff!',
                            settings: true,
                            arguments: [{
                                name: 'version'
                            }],
                            options: [{
                                name: 'list'
                            }]
                        }
                    }
                }, 'test', 'roc')).replace(/ +$/gm, '')).toEqual((
                    /* eslint-disable max-len */
`Usage: roc test [version]

This command will do awesome stuff!

Arguments:
 version

Command options:
 --list

Settings options:
runtime:
 --port             8080

General options:
 -h, --help       Output usage information.
 -v, --version    Output version number.
 -d, --debug      Enable debug mode.
 -c, --config     Path to configuration file, will default to roc.config.js in current working directory.
 -D, --directory  Path to working directory, will default to the current working directory. Can be either absolute or relative.
`
                    /* eslint-enable */
                ));
            });
        });

        describe('getSuggestions', () => {
            it('should suggest the best alternative spelling', () => {
                const suggestion = getSuggestions(['te'], ['tea', 'test', 'testing']);
                expect(stripAnsi(suggestion)).toEqual('Did not understand te - Did you mean tea');
            });

            it('should inform when there is no possible alternative', () => {
                const suggestion = getSuggestions(['te'], ['testing']);
                expect(stripAnsi(suggestion)).toEqual('Did not understand te');
            });

            it('should add -- infront of suggestions if command is enabled', () => {
                const suggestion = getSuggestions(['te'], ['test', 'tea', 'testing'], '--');
                expect(stripAnsi(suggestion)).toEqual('Did not understand --te - Did you mean --tea');
            });
        });

        describe('getMappings', () => {
            it('should create correct number of mappings', () => {
                const mappings = getMappings(complexDocumentObject);
                expect(Object.keys(mappings).length).toBe(23);
            });

            it('should map name and path correctly', () => {
                const mappings = getMappings(complexDocumentObject);
                expect(mappings['build-path'].name).toBe('--build-path');
                expect(mappings['build-path'].path).toBe('build.path');
            });

            describe('should create correct coverters', () => {
                it('boolean', () => {
                    const mappings = getMappings(complexDocumentObject);
                    return consoleMockWrapper((log) => {
                        expect(mappings['build-useDefaultReduxMiddlewares'].convertor(true)).toBe(true);
                        expect(mappings['build-useDefaultReduxMiddlewares'].convertor(false)).toBe(false);

                        expect(mappings['build-useDefaultReduxMiddlewares'].convertor('true')).toBe(true);
                        expect(mappings['build-useDefaultReduxMiddlewares'].convertor('false')).toBe(false);

                        expect(mappings['build-useDefaultReduxMiddlewares'].convertor('asd')).toBe(true);
                        expect(log.calls[0].arguments[0]).toInclude('Invalid value given');
                    });
                });

                it('array', () => {
                    const mappings = getMappings(complexDocumentObject);
                    expect(mappings['build-assets'].convertor('[1, 2, 3]')).toEqual([1, 2, 3]);
                    expect(mappings['build-assets'].convertor('1,2,3')).toEqual(['1', '2', '3']);
                });

                it('number', () => {
                    const mappings = getMappings(complexDocumentObject);
                    expect(mappings['build-port'].convertor('1234')).toEqual(1234);
                });

                it('object', () => {
                    const mappings = getMappings(complexDocumentObject);
                    expect(mappings['build-obj'].convertor('{"value": 12}')).toEqual({ value: 12 });
                });

                it('string', () => {
                    const mappings = getMappings(complexDocumentObject);
                    expect(mappings['build-outputName'].convertor('some string')).toEqual('some string');
                });
            });
        });
    });
});

/*
    generateCommandsDocumentation
    generateCommandDocumentation
    parseOptions
    parseArguments
    buildCompleteConfig
*/
