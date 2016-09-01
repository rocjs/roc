import expect from 'expect';

describe('commands', () => {
    describe('helpers', () => {
        describe('github', () => {
            let github;
            let stream;
            let mkdir;
            let tar;

            before(() => {
                stream = expect.spyOn(require('got'), 'stream');
                mkdir = expect.spyOn(require('temp'), 'mkdir');
                tar = expect.spyOn(require('tar'), 'Extract')
                .andReturn({
                    on: (name, cb) => cb(),
                    end: () => {},
                });
                github = require('../../../src/commands/helpers/github');
            });

            afterEach(() => {
                stream.calls = [];
                mkdir.calls = [];
                tar.calls = [];
            });

            after(() => {
                stream.restore();
                mkdir.restore();
                tar.restore();
            });

            describe('getVersions', () => {
                it('should return a promise', () => {
                    const result = github.getVersions('roc');
                    expect(result).toBeA(Promise);
                });

                it('should throw if no package is given', () => {
                    expect(github.getVersions)
                    .toThrow();
                });
            });

            describe('get', () => {
                it('should return a promise', () => {
                    const result = github.get('roc');
                    expect(result).toBeA(Promise);
                });

                it('should throw if no package is given', () => {
                    expect(github.get)
                    .toThrow();
                });

                it('should reject if error exists', () => {
                    mkdir.andCall((dirName, cb) => {
                        cb('Error');
                    });

                    return github
                    .get('rocjs/roc-template-web-app-web')
                    .catch((err) => {
                        expect(err).toEqual('Error');
                    });
                });

                it('should resolve with directory path when completed', () => {
                    mkdir.andCall((dirName, cb) => {
                        cb(null, 'some/dir/path');
                    });

                    // Mocked stream
                    stream.andCall(() => ({
                        on: () =>
                            ({ pipe: () =>
                                ({ on: () =>
                                    ({ pipe: (writeTar) => {
                                        writeTar.end();
                                        return { on: () => {} };
                                    } }),
                                }),
                            }),
                    })
                    );

                    return github
                    .get('rocjs/roc-template-web-app-web')
                    .then((dirPath) => {
                        expect(dirPath).toBe('some/dir/path');
                        expect(mkdir.calls[0].arguments[0]).toBe('roc');
                    });
                });
            });
        });
    });
});
