import expect from 'expect';

describe('execute', () => {
    let spawn;
    let execute;

    before(() => {
        spawn = expect.spyOn(require('child_process'), 'spawn')
            .andReturn({
                on: (name, cb) => {
                    // To simulate that the commands take some time to complete.
                    setTimeout(() => cb(), 1);
                }
            });
        // Make sure it's empty otherwise the spy above will not work. When using coverage it will be set beforehand.
        delete require.cache[require.resolve('../../src/cli/execute')];

        execute = require('../../src/cli/execute').execute;
    });

    afterEach(() => {
        spawn.calls = [];
    });

    after(() => {
        spawn.restore();
    });

    it('multiple commands are correctly passed through', () => {
        return execute('roc -h & git log & npm view roc').then(() => {
            expect(spawn.calls.length).toEqual(3);
            expect(spawn.calls[0].arguments.slice(0, 2)).toEqual(['roc', ['-h']]);
            expect(spawn.calls[1].arguments.slice(0, 2)).toEqual(['git', ['log']]);
            expect(spawn.calls[2].arguments.slice(0, 2)).toEqual(['npm', ['view', 'roc']]);
        });
    });

    it('single command is correctly passed through', () => {
        return execute('roc --help').then(() => {
            expect(spawn.calls.length).toEqual(1);
            expect(spawn.calls[0].arguments.slice(0, 2)).toEqual(['roc', ['--help']]);
        });
    });

    it('should handle sync commands correctly and run in the correct order', () => {
        return execute('npm view roc && roc -h & git log').then(() => {
            expect(spawn.calls[0].arguments.slice(0, 1)).toEqual(['npm']);
            expect(spawn.calls[1].arguments.slice(0, 1)).toEqual(['git']);
            expect(spawn.calls[2].arguments.slice(0, 1)).toEqual(['roc']);
        });
    });
});
