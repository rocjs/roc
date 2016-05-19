import expect from 'expect';
import path from 'path';

import { consoleMockWrapper } from '../utils';

describe('roc', () => {
    describe('commands', () => {
        describe('init', () => {
            let readdirSync;
            let renameSync;
            let copySync;
            let mkdir;
            let exit;
            let prompt;
            let init;
            let getVersions;
            let get;
            let spawn;

            beforeEach(() => {
                readdirSync = expect.spyOn(require('fs-extra'), 'readdirSync');
                renameSync = expect.spyOn(require('fs-extra'), 'renameSync');
                copySync = expect.spyOn(require('fs-extra'), 'copySync');
                mkdir = expect.spyOn(require('fs-extra'), 'mkdir')
                    .andCall((dirPath, cb) => {
                        cb();
                    });

                exit = expect.spyOn(process, 'exit').andCall(() => {
                    throw new Error('process exit called');
                });
                prompt = expect.spyOn(require('inquirer'), 'prompt');
                getVersions = expect.spyOn(require('../../src/commands/helpers/github'), 'getVersions');
                get = expect.spyOn(require('../../src/commands/helpers/github'), 'get');

                spawn = expect.spyOn(require('cross-spawn'), 'spawn')
                    .andReturn({
                        on: (name, cb) => {
                            cb(0);
                        }
                    });

                // Make sure it's empty otherwise the spy above will not work.
                // When using coverage it will be set beforehand.
                delete require.cache[require.resolve('../../src/commands/init')];

                init = require('../../src/commands/init').default;
            });

            afterEach(() => {
                readdirSync.restore();
                renameSync.restore();
                copySync.restore();
                mkdir.restore();

                exit.calls = [];
                exit.restore();

                spawn.calls = [];
                spawn.restore();

                prompt.calls = [];
                prompt.restore();

                getVersions.restore();
                get.restore();
            });

            after(() => {
            });

            function setupMocks({ versions = [{ name: 'v1.0' }] } = {}) {
                const dirPath = path.join(__dirname, 'data', 'valid-template');

                prompt.andCall((options, cb) => {
                    cb({option: 'web'});
                });
                readdirSync.andReturn([]);
                getVersions.andReturn(Promise.resolve(versions));
                get.andReturn(Promise.resolve(dirPath));

                return dirPath;
            }

            it('should give information about non empty directory and terminate process if selected', () => {
                readdirSync.andReturn([1]);

                prompt.andCall((options, cb) => {
                    cb({selection: 'abort'});
                });

                return consoleMockWrapper(() => {
                    return init({ parsedArguments: { arguments: {} }, parsedOptions: { options: {} } })
                        .catch((error) => {
                            expect(prompt.calls[0].arguments[0][0].message)
                                .toBe(`The directory '${process.cwd()}' is not empty, what do you want to do?`);
                            expect(error).toBeA(Error);
                        });
                });
            });

            it('should give information about non empty directory and ask for name of new if selected', () => {
                readdirSync.andReturn([1]);

                prompt.andCall((options, cb) => {
                    cb({selection: 'new', name: 'test', option: ''});
                });

                return consoleMockWrapper(() => {
                    return init({ parsedArguments: { arguments: {} }, parsedOptions: { options: {} } })
                        .catch(() => {
                            expect(prompt.calls[1].arguments[0][0].message)
                                .toBe('What do you want to name the directory?');
                        });
                });
            });

            it('should give prompt if no template is defined', () => {
                readdirSync.andReturn([]);

                prompt.andCall((options, cb) => {
                    cb({option: ''});
                });

                return consoleMockWrapper(() => {
                    return init({
                        parsedArguments: { arguments: {} },
                        parsedOptions: { options: {} }
                    }).catch(() => expect(prompt.calls[0].arguments[0][0].choices.length).toBe(2));
                });
            });

            it('should terminate if alias does not exists', () => {
                readdirSync.andReturn([]);

                return consoleMockWrapper((log) => {
                    return init({
                        parsedArguments: { arguments: { template: 'roc-template' } },
                        parsedOptions: { options: {} }
                    }).catch((error) => {
                        expect(log.calls[0].arguments[0])
                            .toInclude('Invalid template name given');
                        expect(error).toBeA(Error);
                    });
                });
            });

            it('should directly fetch template if provided by full name without version given', () => {
                const dirPath = setupMocks({ versions: ['1.0'] });

                return consoleMockWrapper((log) => {
                    return init({
                        parsedArguments: { arguments: { template: 'vgno/roc-template-web' } },
                        parsedOptions: { options: {} }
                    })
                    .then(() => {
                        expect(renameSync).toHaveBeenCalledWith(path.join(dirPath, 'package.json'),
                            path.join(dirPath, 'template', '.roc'));
                        expect(copySync).toHaveBeenCalledWith(path.join(dirPath, 'template'),
                            process.cwd());

                        expect(spawn.calls[0].arguments[2].cwd).toEqual(dirPath);
                        expect(spawn.calls[1].arguments[2].cwd).toEqual(process.cwd());

                        expect(log.calls[0].arguments[0]).toInclude('Installing template setup dependencies');
                        expect(log.calls[1].arguments[0]).toInclude('Installing template dependencies');
                        expect(log.calls[2].arguments[0]).toInclude('Setup completed');
                    });
                });
            });

            it('should use directory as install dir', () => {
                const dirPath = setupMocks();

                return consoleMockWrapper(() => {
                    return init({
                        directory: 'roc-directory',
                        parsedArguments: { arguments: { template: 'vgno/roc-template-web' } },
                        parsedOptions: { options: {} }
                    }).then(() => {
                        expect(spawn.calls[0].arguments[2].cwd).toEqual(dirPath);
                        expect(spawn.calls[1].arguments[2].cwd).toEqual(path.join(process.cwd(), 'roc-directory'));
                    });
                });
            });

            it('should choose name over directory', () => {
                const dirPath = setupMocks();

                return consoleMockWrapper(() => {
                    return init({
                        directory: 'roc-directory',
                        parsedArguments: { arguments: { template: 'vgno/roc-template-web', name: 'roc-name' } },
                        parsedOptions: { options: {} }
                    }).then(() => {
                        expect(spawn.calls[0].arguments[2].cwd).toEqual(dirPath);
                        expect(spawn.calls[1].arguments[2].cwd).toEqual(path.join(process.cwd(), 'roc-name'));
                    });
                });
            });

            it('should list versions if asked', () => {
                readdirSync.andReturn([]);
                getVersions.andReturn(Promise.resolve([{name: '1.0'}]));

                return consoleMockWrapper((log) => {
                    return init({
                        parsedArguments: { arguments: { template: 'vgno/roc-template-web' } },
                        parsedOptions: { options: {list: true} }
                    }).catch((err) => {
                        if (err.message !== 'process exit called') {
                            throw err;
                        }

                        expect(log.calls[0].arguments[0]).toInclude('The available versions are:');
                        expect(log.calls[1].arguments[0]).toBe(' 1.0\n master');
                        expect(exit).toHaveBeenCalledWith(0);
                    });
                });
            });

            it('should handle invalid template', () => {
                readdirSync.andReturn([]);
                getVersions.andReturn(Promise.resolve(['1.0']));
                get.andReturn(Promise.resolve(path.join(__dirname, 'data', 'invalid-template')));

                return consoleMockWrapper((log) => {
                    return init({
                        parsedArguments: { arguments: { template: 'vgno/roc-template-web' } },
                        parsedOptions: { options: {} }
                    }).catch((err) => {
                        if (err.message !== 'process exit called') {
                            throw err;
                        }

                        expect(log.calls[0].arguments[0]).toInclude('this is not a Roc template');
                        expect(exit).toHaveBeenCalledWith(1);
                    });
                });
            });

            it('should manage the provided template version as expected', () => {
                const dirPath = setupMocks({ versions: [{ name: 'v1.0' }] });

                return consoleMockWrapper((log) => {
                    return init({
                        parsedArguments: { arguments:
                            { template: 'vgno/roc-template-web', version: 'v1.0' } },
                        parsedOptions: { options: {} }
                    }).then(() => {
                        expect(renameSync).toHaveBeenCalledWith(path.join(dirPath, 'package.json'),
                            path.join(dirPath, 'template', '.roc'));
                        expect(copySync).toHaveBeenCalledWith(path.join(dirPath, 'template'),
                            process.cwd());

                        expect(spawn.calls[0].arguments[2].cwd).toEqual(dirPath);
                        expect(spawn.calls[1].arguments[2].cwd).toEqual(process.cwd());

                        expect(log.calls[0].arguments[0]).toInclude('Installing template setup dependencies');
                        expect(log.calls[1].arguments[0]).toInclude('Installing template dependencies');
                        expect(log.calls[2].arguments[0]).toInclude('Setup completed');
                    });
                });
            });
        });
    });
});
