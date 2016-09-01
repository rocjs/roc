import path from 'path';

import expect, { spyOn } from 'expect';

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

        let logDoneSpy;
        let logErrorSpy;
        let logInfoSpy;
        let logNoteSpy;

        beforeEach(() => {
            logDoneSpy = spyOn(require('../../src/log/default/small').default, 'done');
            logErrorSpy = spyOn(require('../../src/log/default/small').default, 'error');
            logInfoSpy = spyOn(require('../../src/log/default/small').default, 'info');
            logNoteSpy = spyOn(require('../../src/log/default/small').default, 'note');

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
                    },
                });

            // Make sure it's empty otherwise the spy above will not work.
            // When using coverage it will be set beforehand.
            delete require.cache[require.resolve('../../src/commands/init')];

            init = require('../../src/commands/init').default;
        });

        afterEach(() => {
            logErrorSpy.restore();
            logDoneSpy.restore();
            logInfoSpy.restore();
            logNoteSpy.restore();

            readdirSync.restore();
            renameSync.restore();
            copySync.restore();
            mkdir.restore();
            exit.restore();
            spawn.restore();
            prompt.restore();
            getVersions.restore();
            get.restore();
        });

        after(() => {
        });

        function setupMocks({ versions = [{ name: 'v2.0' }] } = {}) {
            const dirPath = path.join(__dirname, 'fixtures', 'valid-template');

            prompt.andCall((options, cb) => {
                cb({ option: 'web' });
            });
            readdirSync.andReturn([]);
            getVersions.andReturn(Promise.resolve(versions));
            get.andReturn(Promise.resolve(dirPath));

            return dirPath;
        }

        it('should give information about non empty directory and terminate process if selected', () => {
            readdirSync.andReturn([1]);

            prompt.andCall((options, cb) => {
                cb({ selection: 'abort' });
            });

            return init({
                arguments: { managed: {} },
                options: { managed: {} },
                context: {},
            }).catch((error) => {
                expect(prompt.calls[0].arguments[0][0].message)
                    .toBe(`The directory '${process.cwd()}' is not empty, what do you want to do?`);
                expect(error).toBeA(Error);
            });
        });

        it('should give information about non empty directory and ask for name of new if selected', () => {
            readdirSync.andReturn([1]);

            prompt.andCall((options, cb) => {
                cb({ selection: 'new', name: 'test', option: '' });
            });

            return init({
                arguments: { managed: {} },
                options: { managed: {} },
                context: {},
            }).catch(() => {
                expect(prompt.calls[1].arguments[0][0].message)
                    .toBe('What do you want to name the directory? ' +
                        `(It will be created in '${process.cwd()}')`);
            });
        });

        it('should give prompt if no template is defined', () => {
            readdirSync.andReturn([]);

            prompt.andCall((options, cb) => {
                cb({ option: '' });
            });

            return init({
                arguments: { managed: {} },
                options: { managed: {} },
                context: {},
            }).catch(() => expect(prompt.calls[0].arguments[0][0].choices.length).toBe(2));
        });

        it('should terminate if alias does not exists', () => {
            readdirSync.andReturn([]);

            init({
                arguments: { managed: { template: 'roc-template' } },
                options: { managed: {} },
                context: {},
            }).then((ok, error) => {
                expect(logErrorSpy.calls[0].arguments[0])
                    .toInclude('Invalid template name given');
                expect(error).toBeA(Error);
            });
        });

        it('should directly fetch template if provided by full name without version given', () => {
            const dirPath = setupMocks({ versions: ['1.0'] });

            init({
                arguments: { managed: { template: 'rocjs/roc-template-web-app' } },
                options: { managed: {} },
                context: {},
            })
            .then(() => {
                expect(renameSync).toHaveBeenCalledWith(path.join(dirPath, 'package.json'),
                    path.join(dirPath, 'template', '.roc'));
                expect(copySync).toHaveBeenCalledWith(path.join(dirPath, 'template'),
                    process.cwd());

                expect(spawn.calls[0].arguments[2].cwd).toEqual(dirPath);
                expect(spawn.calls[1].arguments[2].cwd).toEqual(process.cwd());

                expect(logInfoSpy.calls[0].arguments[0]).toInclude('Installing template setup dependencies');
                expect(logInfoSpy.calls[1].arguments[0]).toInclude('Installing template dependencies');
                expect(logDoneSpy.calls[2].arguments[0]).toInclude('Setup completed');
            });
        });

        it('should use directory as install dir', () => {
            const dirPath = setupMocks();

            return init({
                context: { directory: 'roc-directory' },
                arguments: { managed: { template: 'rocjs/roc-template-web-app-app' } },
                options: { managed: {} },
            }).then(() => {
                expect(spawn.calls[0].arguments[2].cwd).toEqual(dirPath);
                expect(spawn.calls[1].arguments[2].cwd).toEqual(path.join(process.cwd(), 'roc-directory'));
            });
        });

        it('should choose name over directory', () => {
            const dirPath = setupMocks();

            return init({
                context: { directory: 'roc-directory' },
                arguments: { managed: { template: 'rocjs/roc-template-web-app', name: 'roc-name' } },
                options: { managed: {} },
            }).then(() => {
                expect(spawn.calls[0].arguments[2].cwd).toEqual(dirPath);
                expect(spawn.calls[1].arguments[2].cwd)
                    .toEqual(path.join(process.cwd(), 'roc-directory', 'roc-name'));
            });
        });

        it('should list versions if asked', () => {
            readdirSync.andReturn([]);
            getVersions.andReturn(Promise.resolve([{ name: '1.0' }]));

            return init({
                context: {},
                arguments: { managed: { template: 'rocjs/roc-template-web-app' } },
                options: { managed: { list: true } },
            }).catch((err) => {
                if (err.message !== 'process exit called') {
                    throw err;
                }

                expect(logInfoSpy.calls[0].arguments[0]).toInclude('The available versions are:');
                expect(logInfoSpy.calls[1].arguments[0]).toBe(' 1.0\n master');
                expect(exit).toHaveBeenCalledWith(0);
            });
        });

        it('should handle invalid template', () => {
            readdirSync.andReturn([]);
            getVersions.andReturn(Promise.resolve(['1.0']));
            get.andReturn(Promise.resolve(path.join(__dirname, 'fixtures', 'invalid-template')));

            return init({
                context: {},
                arguments: { managed: { template: 'rocjs/roc-template-web-app' } },
                options: { managed: {} },
            }).catch((err) => {
                if (err.message !== 'process exit called') {
                    throw err;
                }

                expect(logErrorSpy.calls[0].arguments[0]).toInclude('this is not a Roc template');
                expect(exit).toHaveBeenCalledWith(1);
            });
        });

        it('should manage the provided template version as expected', () => {
            const dirPath = setupMocks({ versions: [{ name: 'v1.0' }] });

            return init({
                context: {},
                arguments: {
                    managed: {
                        template: 'rocjs/roc-template-web-app',
                        version: 'v1.0',
                    },
                },
                options: { managed: {} },
            }).then(() => {
                expect(renameSync).toHaveBeenCalledWith(path.join(dirPath, 'package.json'),
                    path.join(dirPath, 'template', '.roc'));
                expect(copySync).toHaveBeenCalledWith(path.join(dirPath, 'template'), process.cwd());

                expect(spawn.calls[0].arguments[2].cwd).toEqual(dirPath);
                expect(spawn.calls[1].arguments[2].cwd).toEqual(process.cwd());

                expect(logInfoSpy.calls[0].arguments[0]).toInclude('Installing template setup dependencies');
                expect(logInfoSpy.calls[1].arguments[0]).toInclude('Installing template dependencies');
                expect(logDoneSpy.calls[0].arguments[0]).toInclude('Setup completed');
            });
        });
    });
});
