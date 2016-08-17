import expect, { spyOn } from 'expect';
import stripAnsi from 'strip-ansi';

import runHook from '../../src/hooks/runHook';
import { registerHooks, setHooks } from '../../src/hooks/manageHooks';

describe('hooks', () => {
    describe('runHook', () => {
        let logErrorSpy;
        let runHookDirectlySpy;

        beforeEach(() => {
            logErrorSpy = spyOn(require('../../src/log/default/large').default, 'error'); // eslint-disable-line
            logErrorSpy.andThrow(new Error('process exit'));

            runHookDirectlySpy = spyOn(require('../../src/hooks/runHookDirectly'), 'default'); // eslint-disable-line

            setHooks(
                registerHooks({
                    'hook-name-a': {
                        hasCallback: true,
                    },
                    'hook-name-b': {
                        hasCallback: false,
                    },
                }, 'roc-package-b', {})
            );
        });

        afterEach(() => {
            setHooks(undefined);
            logErrorSpy.restore();
            runHookDirectlySpy.restore();
        });

        it('should manage if the selected extension has no hooks and give suggestion', () => {
            expect(() => runHook('roc-package-a')('hook-name'))
                .toThrow(/process exit/);
            expect(stripAnsi(logErrorSpy.calls[0].arguments[0]))
                .toMatch(/Did not understand roc-package-a - Did you mean roc-package-b/);
        });

        it('should manage if the selected extension has no matching hook and give suggestion', () => {
            expect(() => runHook('roc-package-b')('hook-name-c'))
                .toThrow(/process exit/);
            expect(stripAnsi(logErrorSpy.calls[0].arguments[0]))
                .toMatch(/Did not understand hook-name-c - Did you mean hook-name-a/);
        });

        it('should manage existing hook with callback', () => {
            const callback = function mockCallback() {};
            runHook('roc-package-b')('hook-name-a', 1, 2)(callback);

            expect(runHookDirectlySpy).toHaveBeenCalledWith({
                hasCallback: true, // It should pass the object straight in
                extension: 'roc-package-b',
                name: 'hook-name-a',
            }, [1, 2], callback);
        });

        it('should manage existing hook without callback', () => {
            runHook('roc-package-b')('hook-name-b', 1, 2);

            expect(runHookDirectlySpy).toHaveBeenCalledWith({
                hasCallback: false, // It should pass the object straight in
                extension: 'roc-package-b',
                name: 'hook-name-b',
            }, [1, 2]);
        });
    });
});
