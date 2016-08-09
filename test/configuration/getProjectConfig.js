import path from 'path';
import expect from 'expect';
import stripAnsi from 'strip-ansi';

import getProjectConfig from '../../src/configuration/getProjectConfig';

describe('roc', () => {
    describe('configuration', () => {
        describe('getProjectConfig', () => {
            let log;
            let exit;
            let err;

            beforeEach(() => {
                log = expect.spyOn(console, 'warn');
                err = expect.spyOn(console, 'error');
                // MAKE THIS CORRECT
                exit = expect.spyOn(process, 'exit').andCall(() => {
                    throw new Error('process exit called');
                });
            });

            afterEach(() => {
                exit.calls = [];
                exit.restore();
                log.calls = [];
                log.restore();
                err.restore();
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
                }).toThrow();

                log.restore();
            });

            it('should throw if it´s not a file', () => {
                expect(() => {
                    getProjectConfig(__dirname);
                }).toThrow();

                log.restore();
            });

            it('should give correct feedback if the configuration file is empty', () => {
                const result = getProjectConfig('data/roc.empty.config.js', __dirname);
                expect(result).toEqual({});
                expect(stripAnsi(log.calls[0].arguments.slice(0, 1)[0]))
                    .toInclude('The configuration file at ' +
                        path.join(__dirname, 'data/roc.empty.config.js') + ' was empty.');

                log.restore();
            });

            it('should return the content of a configuration file', () => {
                const result = getProjectConfig('data/roc.simple.config.js', __dirname);
                expect(result).toEqual({
                    settings: {}
                });
            });

            it('should give feedback while in debug mode and default configuration does not exist', () => {
                const result = getProjectConfig(undefined, __dirname, true);
                expect(result).toEqual({});
                expect(stripAnsi(log.calls[0].arguments.slice(0, 1)[0]))
                    .toInclude('Could not find the configuration file at ' + path.join(__dirname, 'roc.config.js'));

                log.restore();
            });

            it('should give feedback when the default configuration has a SyntaxError', () => {
                const result = getProjectConfig('data/roc.syntax-error.config.js.ignore', __dirname);
                expect(result).toEqual({});
                expect(stripAnsi(log.calls[0].arguments.slice(0, 1)[0]))
                    .toInclude('Something is wrong with the configuration file at');

                log.restore();
            });

            it('should inform that and environment variable is set the first time', () => {
                process.env.ROC_CONFIG_PATH = path.join(__dirname, 'data/roc.simple.config.js');
                let result = getProjectConfig('roc.complex.config.js', __dirname);
                expect(result).toEqual({
                    settings: {}
                });
                expect(stripAnsi(log.calls[0].arguments[0]))
                    .toInclude('You have configured a location for the application');

                result = getProjectConfig('data/roc.complex.config.js', __dirname);
                expect(result).toEqual({
                    settings: {}
                });
                expect(log.calls.length).toBe(1);

                log.restore();
            });
        });
    });
});
