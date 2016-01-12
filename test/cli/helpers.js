import expect from 'expect';
import stripAnsi from 'strip-ansi';
import { join } from 'path';

import { consoleMockWrapper } from '../utils';

import { buildCompleteConfig, getSuggestions, getMappings } from '../../src/cli/helpers';

import { complexDocumentObject } from '../documentation/data/documentation-object';

describe('roc', () => {
    describe('cli', () => {
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
                const suggestion = getSuggestions(['te'], ['test', 'tea', 'testing'], true);
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
