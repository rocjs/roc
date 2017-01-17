import { join } from 'path';
import expect, { createSpy, spyOn } from 'expect';

import stripAnsi from 'strip-ansi';
import defaultLog from 'roc-logger/default';

import { consoleMockWrapper } from '../utils';
import runCli from '../../src/cli/runCli';

describe('cli', () => {
    describe('runCli', () => {
        const coreVersion = require('../../package.json').version;

        const spy = createSpy();
        const logError = spyOn(defaultLog.large, 'error').andThrow();

        let logWarningSpy;

        beforeEach(() => {
            logWarningSpy = spyOn(require('roc-logger/default/large'), 'warn'); // eslint-disable-line
            logWarningSpy = spyOn(require('roc-logger/default/large'), 'info'); // eslint-disable-line
        });

        afterEach(() => {
            spy.reset();
            logWarningSpy.restore();
        });

        after(() => {
            expect.restoreSpies();
        });

        it('should return version when requested', () =>
            consoleMockWrapper((log) => {
                runCli({
                    info: { version: '1.0.1' },
                    argv: ['node', '/some/path', '-v'],
                });
                expect(log.calls[0].arguments[0]).toBe(`Unknown: 1.0.1  roc-core: ${coreVersion}`);

                runCli({
                    info: { version: '1.0.1' },
                    argv: ['node', '/some/path', '--version'],
                });
                expect(log.calls[1].arguments[0]).toBe(`Unknown: 1.0.1  roc-core: ${coreVersion}`);

                runCli({
                    argv: ['node', '/some/path', '--version'],
                });
                expect(log.calls[2].arguments[0]).toBe(`Unknown: Unknown  roc-core: ${coreVersion}`);
            }),
        );

        it('should show general information if no command or version is given', () =>
            consoleMockWrapper((log) => {
                runCli({
                    info: { version: '1.0.1' },
                    argv: ['node', '/some/path'],
                });
                expect(log.calls[0].arguments[0]).toInclude('No commands available.');
            }),
        );

        it('should show information if command is invalid', () =>
            consoleMockWrapper(() => {
                expect(() => runCli({
                    info: { version: '1.0.1', name: 'roc-test' },
                    plugins: [require.resolve('./fixtures/plugins/a')],
                    argv: ['node', '/some/path', 'command'],
                })).toThrow();
                expect(stripAnsi(logError.calls[0].arguments[0])).toInclude('Did not understand command');
            }),
        );

        it('should show help info when requested', () =>
            consoleMockWrapper((log) => {
                runCli({
                    info: { version: '1.0.1', name: 'roc-test' },
                    plugins: [require.resolve('./fixtures/plugins/a')],
                    argv: ['node', '/some/path', 'test', '-h'],
                });
                expect(log.calls[0].arguments[0]).toInclude('Usage: roc-test test');
            }),
        );

        it('should call command function', () =>
            consoleMockWrapper(() => {
                require('./fixtures/plugins/a').setSpy(spy);

                runCli({
                    info: { version: '1.0.1', name: 'roc-test' },
                    plugins: [require.resolve('./fixtures/plugins/a')],
                    argv: ['node', '/some/path', 'test'],
                });

                expect(spy.calls[0].arguments[0].info)
                    .toEqual({ version: '1.0.1', name: 'roc-test' });
                expect(spy.calls[0].arguments[0].arguments)
                    .toEqual({ managed: { artifact: undefined }, unmanaged: [] });
                expect(spy.calls[0].arguments[0].options)
                    .toEqual({ managed: { list: undefined }, unmanaged: {} });
            }),
        );

        it('should call relay debug option', () =>
            consoleMockWrapper(() => {
                require('./fixtures/plugins/a').setSpy(spy);

                runCli({
                    info: { version: '1.0.1', name: 'roc-test' },
                    plugins: [require.resolve('./fixtures/plugins/a')],
                    argv: ['node', '/some/path', 'test', '--verbose'],
                });

                expect(spy.calls[0].arguments[0].context.verbose)
                    .toBe(true);
            }),
        );

        it('should parse argument', () => {
            require('./fixtures/plugins/a').setSpy(spy);

            runCli({
                info: { version: '1.0.1', name: 'roc-test' },
                plugins: [require.resolve('./fixtures/plugins/a')],
                argv: [
                    'node',
                    '/some/path',
                    'test',
                    `--directory=${join(__dirname, 'fixtures', 'runCli', 'projects', 'a')}`,
                    '--group1-port=8080',
                ],
            });

            expect(spy.calls[0].arguments[0].context.config.settings)
                .toEqual({
                    group1: {
                        port: 8080,
                    },
                });
        });
    });
});
