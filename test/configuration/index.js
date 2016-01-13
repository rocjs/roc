import expect from 'expect';

import { merge, appendConfig, getConfig, getSettings } from '../../src/configuration';

describe('roc', () => {
    describe('configuration', () => {
        afterEach(() => {
            global.rocConfig = {};
        });

        after(() => {
            // We need to do this since the module remembers if it has been executed before, otherwise watch will
            // not work
            delete require.cache[require.resolve('../../src/configuration/index.js')];
        });

        describe('merge', () => {
            it('should merge correctly', () => {
                expect(merge({a: 1, b: 2}, {c: 3})).toEqual({
                    a: 1,
                    b: 2,
                    c: 3
                });
            });
        });

        describe('getConfig', () => {
            let log;

            beforeEach(() => {
                log = expect.spyOn(console, 'log');
            });

            afterEach(() => {
                log.calls = [];
                log.restore();
                delete process.env.ROC_CONFIG_SETTINGS;
            });

            it('should return correct data', () => {
                const testConfig = { a: 1 };
                appendConfig(testConfig);
                expect(getConfig()).toEqual(testConfig);

                log.restore();
            });

            it('should manage settings defined using environment variable & warn if previous settings existed', () => {
                global.rocConfig = { a: 2, settings: { a: 1 } };
                const testConfig = { b: 1 };
                process.env.ROC_CONFIG_SETTINGS = JSON.stringify(testConfig);
                expect(getConfig()).toEqual({ a: 2, settings: { a: 1, b: 1 } });
                expect(log.calls[0].arguments[0])
                    .toInclude('You have settings defined on the environment variable ROC_CONFIG_SETTINGS');
                log.restore();
            });
        });

        describe('getSettings', () => {
            it('should get settings', () => {
                global.rocConfig = { settings: { a: 1, b: 2 } };
                expect(getSettings('a')).toBe(1);
                expect(getSettings()).toEqual({ a: 1, b: 2 });
            });
        });
    });
});
