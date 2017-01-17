import expect, { spyOn } from 'expect';

import { appendSettings, getSettings } from '../../src/config/manageSettings';

describe('configuration', () => {
    describe('manageSettings', () => {
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

        describe('getSettings', () => {
            it('should get all the settings', () => {
                global.roc.context.config = { settings: { a: 1 } };
                expect(getSettings()).toEqual({ a: 1 });
            });

            it('should get settings for the provided key', () => {
                global.roc.context.config = { settings: { a: { b: 1 } } };
                expect(getSettings('a')).toEqual({ b: 1 });
            });
        });

        describe('appendSettings', () => {
            it('should return correct data', () => {
                const newSettings = { a: 1 };
                expect(() => appendSettings(newSettings)).toThrow(/Process exit/);

                // Init config because it need to defined for this command to work and not process.exit
                global.roc.context.config = {};
                const settings = appendSettings(newSettings);
                expect(getSettings()).toEqual(newSettings);
                expect(settings).toEqual(newSettings);
            });

            it('should return correct data when using customState', () => {
                const customState = {};
                const newSettings = { a: 1 };
                const settings = appendSettings(newSettings, customState);
                expect(settings).toEqual(newSettings);
            });
        });
    });
});
