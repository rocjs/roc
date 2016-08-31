import { sep } from 'path';

import expect from 'expect';

describe('execute', () => {
    let spawn;
    let execute;
    let cwd;

    describe('unsuccessfully runs', () => {
        const status = 5;
        before(() => {
            spawn = expect.spyOn(require('cross-spawn'), 'spawn')
                .andReturn({
                    on: (name, cb) => {
                        // To simulate that the commands take some time to complete.
                        process.nextTick(() => cb(status));
                    },
                });
            // Make sure it's empty otherwise the spy above will not work. When using coverage it will be set by default
            delete require.cache[require.resolve('../../src/execute')];

            execute = require('../../src/execute').default;
        });

        afterEach(() => {
            spawn.calls = [];
        });

        after(() => {
            spawn.restore();
        });

        it('should fail correctly', () =>
            execute('roc --help').catch((statusCode) => {
                expect(statusCode).toEqual(status);
            })
        );
    });

    describe('successfully runs', () => {
        before(() => {
            cwd = expect.spyOn(process, 'cwd').andReturn('/');
            spawn = expect.spyOn(require('cross-spawn'), 'spawn')
                .andReturn({
                    on: (name, cb) => {
                        // To simulate that the commands take some time to complete.
                        process.nextTick(() => cb(0));
                    },
                });
            // Make sure it's empty otherwise the spy above will not work. When using coverage it will be set by default
            delete require.cache[require.resolve('../../src/execute')];

            execute = require('../../src/execute').default;
        });

        afterEach(() => {
            spawn.calls = [];
            cwd.calls = [];
        });

        after(() => {
            spawn.restore();
            cwd.restore();
        });

        it('multiple commands are correctly passed through', () =>
            execute('roc -h & git log & npm view roc').then(() => {
                expect(spawn.calls.length).toEqual(3);
                expect(spawn.calls[0].arguments.slice(0, 2)).toEqual(['roc', ['-h']]);
                expect(spawn.calls[1].arguments.slice(0, 2)).toEqual(['git', ['log']]);
                expect(spawn.calls[2].arguments.slice(0, 2)).toEqual(['npm', ['view', 'roc']]);
            })
        );

        it('single command is correctly passed through', () =>
            execute('roc --help').then(() => {
                expect(spawn.calls.length).toEqual(1);
                expect(spawn.calls[0].arguments.slice(0, 2)).toEqual(['roc', ['--help']]);
            })
        );

        it('should manage strings in commands', () =>
            execute('git commit -m "Version 1.0.0" -a\'Something else important\'').then(() => {
                expect(spawn.calls.length).toEqual(1);
                expect(spawn.calls[0].arguments.slice(0, 2))
                    .toEqual(['git', ['commit', '-m', 'Version 1.0.0', '-a', 'Something else important']]);
            })
        );

        it('should handle sync commands correctly and run in the correct order', () =>
            execute('npm view roc && roc -h & git log').then(() => {
                expect(spawn.calls[0].arguments.slice(0, 1)).toEqual(['npm']);
                expect(spawn.calls[1].arguments.slice(0, 1)).toEqual(['git']);
                expect(spawn.calls[2].arguments.slice(0, 1)).toEqual(['roc']);
            })
        );

        it('should handle cd commands correctly', () =>
            execute('cd my/path && roc && cd other/path && roc').then(() => {
                expect(spawn.calls[0].arguments[2].cwd).toEqual(`${sep}my${sep}path`);
                expect(spawn.calls[1].arguments[2].cwd).toEqual(`${sep}my${sep}path${sep}other${sep}path`);
            })
        );
    });
});
