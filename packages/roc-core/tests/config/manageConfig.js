import expect, { spyOn } from 'expect';

import { appendConfig, getConfig, setConfig } from '../../src/config/manageConfig';

describe('configuration', () => {
    describe('manageConfig', () => {
        after(() => {
            // We need to do this since the module remembers if it has been executed before,
            // otherwise watch will not work
            delete require.cache[require.resolve('../../src/config/manageConfig')];
        });

        let logErrorSpy;
        let logInfoSpy;

        beforeEach(() => {
            logErrorSpy = spyOn(require('roc-logger/default/large'), 'error') // eslint-disable-line
                .andThrow(new Error('Process exit'));

            logInfoSpy = spyOn(require('roc-logger/default/large'), 'info'); // eslint-disable-line
        });

        afterEach(() => {
            logErrorSpy.restore();
            logInfoSpy.restore();
            global.roc.context.config = undefined;
            delete process.env.ROC_CONFIG_SETTINGS;
        });

        describe('getConfig', () => {
            it('should return the provided state if one is provided', () => {
                const config = { a: 1 };
                expect(getConfig(config)).toBe(config);
            });

            it('should manage settings defined using environment variable & warn if previous settings existed', () => {
                global.roc.context.config = { a: 2, settings: { a: 1 } };
                process.env.ROC_CONFIG_SETTINGS = JSON.stringify({ b: 1 });
                expect(getConfig()).toEqual({ a: 2, settings: { a: 1, b: 1 } });
                expect(logInfoSpy.calls[0].arguments[0])
                    .toInclude('You have settings defined on the environment variable');
            });

            it('should manage error when no config has been defined', () => {
                expect(() => getConfig()).toThrow(/Process exit/);
                expect(logErrorSpy.calls[0].arguments[0]).toInclude('It seems that you are launching');
            });
        });

        describe('appendConfig', () => {
            it('should return correct data', () => {
                global.roc.context.config = {};
                const testConfig = { a: 1 };
                appendConfig(testConfig);
                expect(getConfig()).toEqual(testConfig);
            });
        });

        describe('setConfig', () => {
            it('should set config on global when no custom state is provided', () => {
                const testConfig = { a: 1 };
                setConfig(testConfig);
                expect(getConfig()).toEqual(testConfig);
            });

            it('should not modify global when second argument is false', () => {
                const newConfig = { a: 1 };
                const config = setConfig(newConfig, false);
                expect(config).toEqual(newConfig);
                expect(global.roc.context.config).toBe(undefined);
            });
        });
    });
});
