import expect from 'expect';

import {
    isValid,
    validate,
    validateMightThrow,
    throwError
} from '../../src/validation';

import * as mock from './data/configs';

describe('roc', () => {
    describe('validation', () => {
        describe('isValid', () => {
            it('should run the validator on the value if a function', () => {
                const spy = expect.createSpy();
                isValid('value', spy);
                expect(spy).toHaveBeenCalledWith('value');
            });

            it('should return true if value match the RegExp', () => {
                expect(isValid('value', /\w/))
                    .toBe(true);
            });

            it('should return error message if value does NOT match the RegExp', () => {
                expect(isValid('value', /\d/))
                    .toBeA('string');
            });

            it('should throw if validator is defined but not a function or RegExp', () => {
                expect(isValid)
                    .withArgs('value', 2)
                    .toThrow();
            });

            it('should return true if validator is undefined', () => {
                expect(isValid('value'))
                    .toBe(true);
            });
        });

        describe('validate', () => {
            const spyRuntime = expect.createSpy().andReturn(true);
            const spyBuild = expect.createSpy().andReturn(true);
            const settings = { runtime: { port: 80 }, build: { target: 'client' } };
            const metaSettings = { validations: { runtime: { port: spyRuntime }, build: { target: spyBuild } } };

            afterEach(() => {
                spyRuntime.calls = [];
                spyBuild.calls = [];
            });

            it('should validate everything by default', () => {
                validate(settings, metaSettings);

                expect(spyRuntime).toHaveBeenCalledWith(80);
                expect(spyBuild).toHaveBeenCalledWith('client');
            });

            it('should only validate selected groups', () => {
                validate(settings, metaSettings, ['build']);

                expect(spyRuntime.calls.length).toBe(0);
                expect(spyBuild).toHaveBeenCalledWith('client');
            });

            it('should manage execptions correctly', () => {
                const spyLog = expect.spyOn(console, 'log');
                const spyExit = expect.spyOn(process, 'exit');

                validate(settings, { validations: { runtime: { port: () => false } } });

                expect(spyLog).toHaveBeenCalled();
                expect(spyExit).toHaveBeenCalledWith(1);

                spyLog.restore();
                spyExit.restore();
            });
        });

        describe('validateMightThrow', () => {
            it('should be a function', () => {
                expect(validateMightThrow)
                    .toBeA('function');
            });

            it('should NOT throw by default', () => {
                expect(validateMightThrow)
                    .toNotThrow();
            });

            it('should NOT throw if all connected validate functions return true', () => {
                expect(validateMightThrow)
                    .withArgs(mock.flatConfig, mock.flatValidMetaConfig.validations)
                    .toNotThrow();
            });

            it('should NOT throw if all nested and connected validate functions return true', () => {
                expect(validateMightThrow)
                    .withArgs(mock.nestedConfig, mock.nestedValidMetaConfig.validations)
                    .toNotThrow();
            });

            it('should NOT throw if nested and connected validate functions return true given expected inputs', () => {
                expect(validateMightThrow)
                    .withArgs(mock.nestedConfig, mock.nestedEvaluateMetaConfig.validations)
                    .toNotThrow();
            });

            it('should NOT throw if all connected RegExp´s match', () => {
                expect(validateMightThrow)
                    .withArgs(mock.flatConfig, mock.flatRegexValidMetaConfig.validations)
                    .toNotThrow();
            });

            it('should NOT throw if all nested and connected RegExp´s match', () => {
                expect(validateMightThrow)
                    .withArgs(mock.nestedConfig, mock.nestedRegexValidMetaConfig.validations)
                    .toNotThrow();
            });

            it('should throw if validation structure does not match that of the configuration', () => {
                expect(validateMightThrow)
                    .withArgs(mock.flatConfig, mock.flatMismatchMetaConfig.validations)
                    .toThrow();
            });

            it('should throw if any connected validate functions return false', () => {
                expect(validateMightThrow)
                    .withArgs(mock.flatConfig, mock.flatInvalidMetaConfig.validations)
                    .toThrow();
            });

            it('should throw if any nested and connected validate functions return false', () => {
                expect(validateMightThrow)
                    .withArgs(mock.nestedConfig, mock.nestedInvalidMetaConfig.validations)
                    .toThrow();
            });

            it('should throw if any connected validate RegExp´s do not match', () => {
                expect(validateMightThrow)
                    .withArgs(mock.flatConfig, mock.flatRegexInvalidMetaConfig.validations)
                    .toThrow();
            });

            it('should throw if any nested and connected RegExp´s do not match', () => {
                expect(validateMightThrow)
                    .withArgs(mock.nestedConfig, mock.nestedRegexInvalidMetaConfig.validations)
                    .toThrow();
            });
        });

        describe('throwError', () => {
            it('should throw with a correct message when value is defined', () => {
                expect(throwError)
                    .withArgs('name', 'message', 'value')
                    .toThrow(/Validation failed/);
            });
        });
    });
});
