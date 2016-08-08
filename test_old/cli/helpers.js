import expect from 'expect';
import stripAnsi from 'strip-ansi';
import { join } from 'path';

import { consoleMockWrapper } from '../utils';

import { isString } from '../../src/validation/validators';
import {
    buildCompleteConfig,
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
                    .andReturn(join(__dirname, 'data', 'mock-package.js'));
            });

            afterEach(() => {
                resolveSync.calls = [];
                resolveSync.restore();
            });

            it('should correctly build configuration objects', () => {
                return consoleMockWrapper(() => {
                    const result = buildCompleteConfig(true, {settings: {}, mismatch: {}}, {settings: {}}, {}, {},
                        join(__dirname, 'data', 'valid'), true);

                    expect(result).toEqual({
                        packageConfig: {settings: {}},
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
                    }, {}, 'command', {
                        command: {
                            options: [{
                                name: 'list',
                                required: true
                            }]
                        }
                    }).toThrow();
                });
            });

            it('should correctly map the options', () => {
                return consoleMockWrapper(() => {
                    expect(parseOptions({
                        list: 'hello',
                        t: true
                    }, {}, 'command', {
                        command: {
                            options: [{
                                name: 'list',
                                required: true
                            }, {
                                name: 'test',
                                shortname: 't',
                                required: true
                            }]
                        }
                    })).toEqual({
                        settings: {},
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
                    }, {}, 'command', {
                        command: {
                            options: [{
                                name: 'list',
                                validation: isString,
                                required: true
                            }]
                        }
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
 help
 test [version]   This command will do awesome stuff!

General options:
 -c, --config     Path to configuration file, will default to roc.config.js in current working directory.
 -d, --directory  Path to working directory, will default to the current working directory. Can be either absolute or relative.
 -h, --help       Output usage information.
 -V, --verbose    Enable verbose mode.
 -v, --version    Output version number.
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
 -c, --config     Path to configuration file, will default to roc.config.js in current working directory.
 -d, --directory  Path to working directory, will default to the current working directory. Can be either absolute or relative.
 -h, --help       Output usage information.
 -V, --verbose    Enable verbose mode.
 -v, --version    Output version number.
`
                    /* eslint-enable */
                ));
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
        });
    });
});
