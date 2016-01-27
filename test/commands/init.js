import expect from 'expect';
import path from 'path';

import { consoleMockWrapper } from '../utils';

describe('roc', () => {
    describe('commands', () => {
        describe('init', () => {
            let readdirSync;
            let renameSync;
            let copySync;
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

                exit = expect.spyOn(process, 'exit').andCall(() => {
                    throw new Error('process exit called');
                });
                prompt = expect.spyOn(require('inquirer'), 'prompt');
                getVersions = expect.spyOn(require('../../src/commands/helpers/github'), 'getVersions');
                get = expect.spyOn(require('../../src/commands/helpers/github'), 'get');

                spawn = expect.spyOn(require('child_process'), 'spawn')
                    .andReturn({
                        on: (name, cb) => {
                            cb(0);
                        }
                    });

                // Make sure it's empty otherwise the spy above will not work.
                // When using coverage it will be set beforehand.
                delete require.cache[require.resolve('../../src/commands/init')];

                init = require('../../src/commands/init');
            });

            afterEach(() => {
                readdirSync.restore();
                renameSync.restore();
                copySync.restore();

                exit.calls = [];
                exit.restore();

                spawn.calls = [];
                spawn.restore();

                prompt.restore();
                getVersions.restore();
                get.restore();
            });

            after(() => {
            });

            it('should give information about non empty directory and terminate process', () => {
                readdirSync.andReturn([1]);

                return consoleMockWrapper((log) => {
                    expect(init)
                        .withArgs({ parsedArguments: { arguments: {} }, parsedOptions: { options: {} } })
                        .toThrow();

                    expect(log.calls[0].arguments[0]).toInclude('need to call this command from an empty');
                });
            });

            it('should give prompt if no template is defined', () => {
                readdirSync.andReturn([]);

                return consoleMockWrapper(() => {
                    init({
                        parsedArguments: { arguments: {} },
                        parsedOptions: { options: {} }
                    });
                    expect(prompt.calls[0].arguments[0][0].choices.length).toBe(2);
                });
            });

            it('should terminate if alias does not exists', () => {
                readdirSync.andReturn([]);

                return consoleMockWrapper((log) => {
                    expect(init)
                        .withArgs({
                            parsedArguments: { arguments: { template: 'roc-template' } },
                            parsedOptions: { options: {} }
                        })
                        .toThrow();

                    expect(log).toHaveBeenCalled();
                    expect(exit).toHaveBeenCalledWith(1);
                });
            });

            it('should directly fetch template if provided by full name without version given', () => {
                const dirPath = path.join(__dirname, 'data', 'valid-template');

                prompt.andCall((options, cb) => {
                    cb({option: 'web'});
                });
                readdirSync.andReturn([]);
                getVersions.andReturn(Promise.resolve(['1.0']));
                get.andReturn(Promise.resolve(dirPath));
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
                const dirPath = path.join(__dirname, 'data', 'valid-template');

                prompt.andCall((options, cb) => {
                    cb({option: 'web'});
                });
                readdirSync.andReturn([]);
                getVersions.andReturn(Promise.resolve([{name: 'v1.0'}]));
                get.andReturn(Promise.resolve(path.join(__dirname, 'data', 'valid-template')));
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
