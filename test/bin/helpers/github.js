import expect from 'expect';

describe('roc', () => {
    describe('bin helpers', () => {
        describe('github', () => {
            let github;
            let get;
            let mkdir;

            before(() => {
                get = expect.spyOn(require('request'), 'get');
                mkdir = expect.spyOn(require('temp'), 'mkdir');
                github = require('../../../src/bin/commands/helpers/github');
            });

            afterEach(() => {
                get.calls = [];
                mkdir.calls = [];
            });

            after(() => {
                get.restore();
                mkdir.restore();
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

                it('should reject promise upon request error', () => {
                    get.andCall((fetchObject, cb) => {
                        cb('Error');
                    });

                    return github
                        .getVersions('roc')
                        .catch((err) => {
                            expect(err).toEqual('Error');
                        });
                });

                it('should reject promise upon non 200 status code', () => {
                    get.andCall((fetchObject, cb) => {
                        cb(null, { statusCode: 500 });
                    });

                    return github
                        .getVersions('roc')
                        .catch((err) => {
                            expect(err.message).toInclude('returned 500');
                        });
                });

                it('should resolve when reciving 200 as status code', () => {
                    const body = { a: 1 };
                    get.andCall((fetchObject, cb) => {
                        cb(null, { statusCode: 200 }, JSON.stringify(body));
                    });

                    return github
                        .getVersions('roc')
                        .then((result) => {
                            expect(get.calls[0].arguments[0].url).toBe('https://api.github.com/repos/roc/tags');
                            expect(result).toEqual(body);
                        });
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
                        .get('vgno/roc-template-web')
                        .catch((err) => {
                            expect(err).toEqual('Error');
                        });
                });

                it('should resolve with directory path when completed', () => {
                    mkdir.andCall((dirName, cb) => {
                        cb(null, 'some/dir/path');
                    });

                    // Mocked stream
                    get.andCall(() => {
                        return {
                            on: () =>
                                ({ pipe: () =>
                                    ({ on: () =>
                                        ({ pipe: (writeTar) => {
                                            writeTar.end();
                                            return { on: () => {} };
                                        }})
                                    })
                                })
                        };
                    });

                    return github
                        .get('vgno/roc-template-web')
                        .then((dirPath) => {
                            expect(dirPath).toBe('some/dir/path');
                            expect(mkdir.calls[0].arguments[0]).toBe('roc');
                        });
                });
            });
        });
    });
});
