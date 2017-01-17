import expect from 'expect';

import proxyquire from 'proxyquire';

describe('execute', () => {
    let exitCode;
    let spawnError;
    const spawnSpyExit = expect.createSpy()
        .andReturn({
            on: (name, cb) => {
                if (name === 'exit') {
                    process.nextTick(() => cb(exitCode));
                } else {
                    process.nextTick(() => cb(spawnError));
                }
            },
        });

    const execute = proxyquire('../src/execute', {
        'spawn-command': spawnSpyExit,
    }).default;

    describe('exit', () => {
        it('should reject the promise with an error and the correct exit code', () => {
            exitCode = 1;
            return execute('roc --help').catch((error) => {
                expect(error.getExitCode()).toBe(exitCode);
                expect(error.toString()).toInclude('The command "roc --help" failed with error code 1');
            });
        });

        it('should resolve the promise with the correct exit code', () => {
            exitCode = 0;
            return execute('roc --help').then((code) => {
                expect(code).toBe(exitCode);
            });
        });
    });

    describe('error', () => {
        it('should reject the promise with the same error as received', () => {
            spawnError = new Error('a error happened');
            return execute('roc --help').catch((error) => {
                expect(error).toBe(spawnError);
            });
        });
    });
});
