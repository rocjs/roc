import expect, { spyOn, createSpy } from 'expect';

import stripAnsi from 'strip-ansi';

import runHookDirectly from '../../src/hooks/runHookDirectly';

describe('hooks', () => {
    describe('runHookDirectly', () => {
        let logErrorSpy;
        let getActionsSpy;

        beforeEach(() => {
            logErrorSpy = spyOn(require('roc-logger/default').large, 'error'); // eslint-disable-line
            logErrorSpy.andThrow(new Error('process exit'));

            getActionsSpy = spyOn(require('../../src/hooks/manageActions'), 'getActions'); // eslint-disable-line
            getActionsSpy.andReturn([]);
        });

        afterEach(() => {
            logErrorSpy.restore();
            getActionsSpy.restore();
        });

        it('should validate arguments if hook supports it', () => {
            const run = (...args) => runHookDirectly({
                arguments: [{
                    validator: (input) => input === 1,
                    name: 'arg1',
                }, {
                    validator: (input) => input === 2,
                    name: 'arg2',
                }],
            }, args);

            expect(() => run(1, 2)).toNotThrow();
            expect(() => run(1, 100)).toThrow(/process exit/);
            expect(stripAnsi(logErrorSpy.calls[0].arguments)).toMatch(/Validation failed for argument arg2/);
        });

        it('should run all matching actions for a hook', () => {
            const actionSpy1 = createSpy();
            const actionSpy2 = createSpy();
            const actionSpy3 = createSpy();

            const restoreActionSpies = () => {
                actionSpy1.restore();
                actionSpy2.restore();
                actionSpy3.restore();
            };

            getActionsSpy.andReturn([{
                name: 'roc-package-c',
                actions: [{
                    // Only registered to an extension
                    extension: 'roc-package-a',
                    action: actionSpy1,
                }, {
                    // Registered to both an extension and a hook
                    extension: 'roc-package-b',
                    hook: 'hook-name-a',
                    action: actionSpy2,
                }, {
                    // Generic action, will run for all hooks
                    action: actionSpy3,
                }],
            }]);

            runHookDirectly({
                extension: 'roc-package-a',
            });
            expect(actionSpy1).toHaveBeenCalled();
            expect(actionSpy3).toHaveBeenCalled();

            restoreActionSpies();

            runHookDirectly({
                extension: 'roc-package-c',
            });
            expect(actionSpy3).toHaveBeenCalled();

            restoreActionSpies();

            runHookDirectly({
                extension: 'roc-package-b',
                name: 'hook-name-a',
            });
            expect(actionSpy2).toHaveBeenCalled();
            expect(actionSpy3).toHaveBeenCalled();
        });

        it('should run all matching post-actions for a hook', () => {
            const order = [];
            const actionSpy1 = createSpy().andCall(() => { order.push(1); });
            const actionSpy2 = createSpy().andCall(() => { order.push(2); });
            const actionSpy3 = createSpy().andCall(() => { order.push(3); });
            const actionSpy4 = createSpy().andCall(() => { order.push(4); });
            const actionSpy5 = createSpy().andCall(() => { order.push(5); });

            getActionsSpy.andReturn([{
                name: 'roc-package-c',
                actions: [{
                    // Only registered to an extension
                    extension: 'roc-package-a',
                    action: actionSpy1,
                    post: actionSpy5,
                }, {
                    // Registered to both an extension and a hook
                    extension: 'roc-package-b',
                    hook: 'hook-name-a',
                    action: actionSpy2,
                }, {
                    // Generic action, will run for all hooks
                    action: actionSpy3,
                    post: actionSpy4,
                }],
            }]);

            runHookDirectly({
                extension: 'roc-package-a',
            });
            expect(actionSpy1).toHaveBeenCalled();
            expect(actionSpy3).toHaveBeenCalled();
            expect(actionSpy4).toHaveBeenCalled();
            expect(order).toEqual([1, 3, 4, 5]);
        });

        it('should run the correct action chain', () => {
            const callback = createSpy();

            const actionSpy1$3 = createSpy().andReturn('return value');
            const actionSpy1$2 = createSpy().andReturn(actionSpy1$3);
            const actionSpy1$1 = createSpy().andReturn(actionSpy1$2);

            const actionSpy2$3 = createSpy().andReturn('return result');
            const actionSpy2$2 = createSpy().andReturn(actionSpy2$3);
            const actionSpy2$1 = createSpy().andReturn(actionSpy2$2);

            getActionsSpy.andReturn([{
                name: 'roc-package-c',
                actions: [{
                    // Generic action, will run for all hooks
                    action: actionSpy1$1,
                }, {
                    // Generic action, will run for all hooks
                    action: actionSpy2$1,
                }],
            }]);

            expect(() => runHookDirectly({
                extension: 'roc-package-a',
                returns: (input) => input === 'return value',
                initialValue: 404,
            }, [1, 2, 3], callback))
                .toThrow(/process exit/);

            expect(stripAnsi(logErrorSpy.calls[0].arguments)).toMatch(/A return value was not valid/);

            expect(actionSpy1$1.calls[0].arguments[0]).toIncludeKeys([
                'context',
                'description',
                'extension',
                'hook',
                'previousValue',
            ]);
            expect(actionSpy1$1.calls[0].arguments[0].previousValue).toEqual(404);
            expect(actionSpy1$2.calls[0].arguments).toEqual([1, 2, 3]);
            expect(actionSpy2$1.calls[0].arguments[0].previousValue).toEqual('return value');
            expect(actionSpy2$2.calls[0].arguments).toEqual([1, 2, 3]);
            expect(callback.calls[0].arguments[0]).toBe('return value');
            expect(callback.calls.length).toBe(1);
        });
    });
});
