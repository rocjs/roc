import { join } from 'path';

import expect, { createSpy, spyOn } from 'expect';

import buildExtensionTree from '../../../src/context/extensions/buildExtensionTree';

describe('context', () => {
    describe('buildExtensionTree', () => {
        const basePath = join(__dirname, '..', 'fixtures', 'extensions', 'buildExtensionTree');

        const baseContext = {
            actions: [],
            commands: {},
            config: {},
            dependencies: {
                exports: {},
                uses: {},
                requires: {},
            },
            directory: __dirname,
            extensionConfig: {},
            hooks: {},
            meta: {},
            projectExtensions: [],
            packageJSON: {},
            usedExtensions: [],
            verbose: false,
        };

        let logWarningSpy;

        beforeEach(() => {
            logWarningSpy = spyOn(require('../../../src/log/default/large').default, 'warn'); // eslint-disable-line
        });

        afterEach(() => {
            logWarningSpy.restore();
        });

        it('should build the expected context', () => {
            const initSpy = createSpy().andReturn({});
            const postInitSpy = createSpy().andReturn({});

            // Modify the value in the require cache
            const packageA = require(join(basePath, 'packages', 'a'));
            packageA.roc = {
                ...packageA.roc,
                config: {},
                plugins: [join(basePath, 'plugins', 'b', 'index.js')],
                required: {
                    roc: '^1.0.0-rc',
                },
                postInit: postInitSpy,
                actions: [() => {}],
            };

            const pluginA = require(join(basePath, 'plugins', 'a'));
            pluginA.roc = {
                ...pluginA.roc,
                config: {},
                required: {
                    'roc-plugin-b': '1.2.3',
                },
            };

            const packageB = require(join(basePath, 'packages', 'b'));
            packageB.roc = {
                ...packageB.roc,
                config: {},
                init: initSpy,
                actions: [() => {}],
            };

            const pluginB = require(join(basePath, 'plugins', 'b'));
            pluginB.roc = {
                ...pluginB.roc,
                config: {},
            };


            const state = buildExtensionTree(
                { ...baseContext },
                [join(basePath, 'packages', 'a'), join(basePath, 'packages', 'b')],
                [join(basePath, 'plugins', 'a')],
                true
            );

            expect(logWarningSpy).toNotHaveBeenCalled();
            expect(state.context.usedExtensions.map(({ name }) => name)).toEqual([
                'roc-plugin-b',
                'roc-package-a',
                'roc-package-b',
                'roc-plugin-a',
            ]);
            expect(state.context.projectExtensions.length).toBe(3);
            expect(initSpy).toHaveBeenCalled();
            expect(postInitSpy).toHaveBeenCalled();
        });

        it('should handle "error" in init', () => {
            const initSpy = createSpy().andReturn('There was a problem!');

            // Modify the value in the require cache
            const packageA = require(join(basePath, 'packages', 'a'));
            packageA.roc = {
                ...packageA.roc,
                config: {},
                plugins: [join(basePath, 'plugins', 'b', 'index.js')],
            };

            const pluginA = require(join(basePath, 'plugins', 'a'));
            pluginA.roc = {
                ...pluginA.roc,
                config: {},
            };

            const packageB = require(join(basePath, 'packages', 'b'));
            packageB.roc = {
                ...packageB.roc,
                config: {},
                // This spy will make this to not be processed
                init: initSpy,
            };

            const pluginB = require(join(basePath, 'plugins', 'b'));
            pluginB.roc = {
                ...pluginB.roc,
                config: {},
            };


            const state = buildExtensionTree(
                { ...baseContext },
                [join(basePath, 'packages', 'a'), join(basePath, 'packages', 'b')],
                [join(basePath, 'plugins', 'a')],
                true
            );

            expect(logWarningSpy).toHaveBeenCalled();
            expect(logWarningSpy.calls[0].arguments[2].message)
                .toMatch(/here was a problem when running init. There was a problem!/);
            expect(state.context.usedExtensions.map(({ name }) => name)).toEqual([
                'roc-plugin-b',
                'roc-package-a',
                'roc-plugin-a',
            ]);
            expect(state.context.projectExtensions.map(({ name }) => name)).toEqual([
                'roc-package-a',
                'roc-plugin-a',
            ]);
        });

        it('should handle when an extension can not be found', () => {
            const state = buildExtensionTree(
                { ...baseContext },
                ['dont-exist'],
                [],
                true
            );

            expect(logWarningSpy).toHaveBeenCalled();
            expect(logWarningSpy.calls[0].arguments[2].message).toMatch(/Cannot find module dont-exist/);
            expect(state.context.usedExtensions.length).toBe(0);
            expect(state.context.projectExtensions.length).toBe(0);
        });

        it('should handle missing required in init', () => {
            // Modify the value in the require cache
            const pluginA = require(join(basePath, 'plugins', 'a'));
            pluginA.roc = {
                ...pluginA.roc,
                config: {},
                required: {
                    'roc-plugin-b': '1.2.3',
                },
            };

            const state = buildExtensionTree(
                { ...baseContext },
                [],
                [join(basePath, 'plugins', 'a')],
                true
            );

            expect(logWarningSpy).toHaveBeenCalled();
            expect(logWarningSpy.calls[0].arguments[2].message).toMatch(/Could not find required extension./);
            expect(state.context.usedExtensions.length).toBe(0);
            expect(state.context.projectExtensions.length).toBe(0);
        });
    });
});
