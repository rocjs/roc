import expect from 'expect';

import { appendConfig, getConfig } from '../../src/configuration/manageConfig';

describe('roc', () => {
    describe('configuration', () => {
        afterEach(() => {
            global.roc.config = {};
        });

        after(() => {
            // We need to do this since the module remembers if it has been executed before,
            // otherwise watch will not work
            delete require.cache[require.resolve('../../src/configuration/manageConfig')];
        });

        describe('getConfig', () => {
            let log;

            beforeEach(() => {
                log = expect.spyOn(console, 'info');
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
                global.roc.config = { a: 2, settings: { a: 1 } };
                const testConfig = { b: 1 };
                process.env.ROC_CONFIG_SETTINGS = JSON.stringify(testConfig);
                expect(getConfig()).toEqual({ a: 2, settings: { a: 1, b: 1 } });
                expect(log.calls[0].arguments[0])
                    .toInclude('You have settings defined on the environment variable');
                log.restore();
            });
        });
    });
});
