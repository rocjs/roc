import path from 'path';

import expect, { spyOn } from 'expect';
import stripAnsi from 'strip-ansi';

import getProjectConfig from '../../src/configuration/getProjectConfig';

describe('configuration', () => {
    describe('getProjectConfig', () => {
        let logErrorSpy;
        let logWarningSpy;

        beforeEach(() => {
            logErrorSpy = spyOn(require('../../src/log/default/large').default, 'error') // eslint-disable-line
                .andThrow(new Error('Process exit'));

            logWarningSpy = spyOn(require('../../src/log/default/large').default, 'warn'); // eslint-disable-line
        });

        afterEach(() => {
            logErrorSpy.restore();
            logWarningSpy.restore();
            delete process.env.ROC_CONFIG_PATH;
        });

        after(() => {
            // We need to do this since the module remembers if it has been executed before, otherwise watch will
            // not work
            delete require.cache[require.resolve('../../src/configuration/getProjectConfig')];
        });

        it('should throw when file don´t exists', () => {
            expect(() => {
                getProjectConfig('roc.js', __dirname);
            }).toThrow(/Process exit/);
            expect(logErrorSpy.calls[0].arguments[0]).toInclude('Configuration path points to unaccessible file');
        });

        it('should throw if it is not a file', () => {
            expect(() => {
                getProjectConfig(__dirname);
            }).toThrow(/Process exit/);
            expect(logErrorSpy.calls[0].arguments[0]).toInclude('Configuration path points to unaccessible file');
        });

        it('should give correct feedback if the configuration file is empty', () => {
            const result = getProjectConfig('fixtures/roc.empty.config.js', __dirname);
            expect(result).toEqual({});
            expect(stripAnsi(logWarningSpy.calls[0].arguments[0]))
                .toInclude('The configuration file at ' +
                    path.join(__dirname, 'fixtures', 'roc.empty.config.js') + ' was empty.');
        });

        it('should return the content of a configuration file', () => {
            const result = getProjectConfig('fixtures/roc.simple.config.js', __dirname);
            expect(result).toEqual({
                settings: {},
            });
        });

        it('should give feedback while in debug mode and default configuration does not exist', () => {
            const result = getProjectConfig(undefined, __dirname, true);
            expect(result).toEqual({});
            expect(stripAnsi(logWarningSpy.calls[0].arguments[0]))
                .toInclude('Could not find the configuration file at ' + path.join(__dirname, 'roc.config.js'));
        });

        it('should give feedback when the default configuration has a SyntaxError', () => {
            const result = getProjectConfig('fixtures/roc.syntax-error.config.js.ignore', __dirname);
            expect(result).toEqual({});
            expect(stripAnsi(logWarningSpy.calls[0].arguments[0]))
                .toInclude('Something is wrong with the configuration file at');
        });

        it('should inform that and environment variable is set the first time', () => {
            process.env.ROC_CONFIG_PATH = path.join(__dirname, 'fixtures', 'roc.simple.config.js');
            let result = getProjectConfig('roc.complex.config.js', __dirname);
            expect(result).toEqual({
                settings: {},
            });
            expect(stripAnsi(logWarningSpy.calls[0].arguments[0]))
                .toInclude('You have configured a location for the application');

            result = getProjectConfig('fixtures/roc.complex.config.js', __dirname);
            expect(result).toEqual({
                settings: {},
            });
            expect(logWarningSpy.calls.length).toBe(1);
        });
    });
});
