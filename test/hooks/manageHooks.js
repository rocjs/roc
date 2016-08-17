import expect from 'expect';

import {
    registerHooks,
} from '../../src/hooks/manageHooks';

describe('hooks', () => {
    describe('manageHooks', () => {
        describe('registerHooks', () => {
            const testHooks = {
                a: {},
                b: {},
            };

            it('should not mutate the state', () => {
                const originalState = {};
                registerHooks(testHooks, 'roc-package-b', {});

                expect(originalState)
                    .toEqual({});
            });

            it('should register new hooks correctly', () => {
                const newState = registerHooks(testHooks, 'roc-package-b', {});

                expect(Object.keys(newState).length)
                    .toBe(1);
                expect(newState['roc-package-b'])
                    .toEqual(testHooks);
            });
        });
    });
});
