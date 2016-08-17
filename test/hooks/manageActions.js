import expect from 'expect';

import {
    registerActions,
    registerAction,
    removeActions,
} from '../../src/hooks/manageActions';

describe('hooks', () => {
    describe('manageActions', () => {
        describe('registerActions', () => {
            // A action can either be an object or a function
            const testActions = [{
                action: () => {},
                extension: 'roc-package-a',
                hook: 'some-hook',
                description: 'a description',
                post: () => {},
            }, () => {}];

            it('should not mutate the state', () => {
                const originalState = [];
                registerAction(testActions, 'roc-package-b', originalState);

                expect(originalState.length)
                    .toBe(0);
            });

            it('should register new actions correctly', () => {
                const originalState = [];
                const newState = registerActions(testActions, 'roc-package-b', originalState);

                // Make sure we do not alter the original state
                expect(originalState.length)
                    .toBe(0);

                expect(newState.length)
                    .toBe(1);
                expect(newState[0])
                    .toEqual({
                        project: false,
                        name: 'roc-package-b',
                        actions: [{
                            action: testActions[0].action,
                            extension: testActions[0].extension,
                            hook: testActions[0].hook,
                            description: testActions[0].description,
                            post: testActions[0].post,
                        }, {
                            action: testActions[1],
                            extension: undefined,
                            hook: undefined,
                            description: undefined,
                            post: undefined,
                        }],
                    });
            });

            it('should not do anything if already registered extension', () => {
                const oldState = registerActions(testActions, 'roc-package-b', []);
                const newState = registerActions([], 'roc-package-b', oldState);

                expect(newState).toBe(oldState);
            });
        });

        describe('registerAction', () => {
            const actionFunction = () => {};

            it('should not mutate the state', () => {
                const originalState = [];
                registerAction(actionFunction, 'roc-package-b', originalState);

                expect(originalState.length)
                    .toBe(0);
            });

            it('should register a new action correctly', () => {
                const originalState = [];
                const newState = registerAction(actionFunction, 'roc-package-b', originalState);

                expect(newState.length)
                    .toBe(1);
                expect(newState[0])
                    .toEqual({
                        project: false,
                        name: 'roc-package-b',
                        actions: [
                            {
                                action: actionFunction,
                                extension: undefined,
                                hook: undefined,
                                description: undefined,
                                post: undefined,
                            },
                        ],
                    });
            });

            it('should update if already registered extension', () => {
                const state1 = registerAction(actionFunction, 'roc-package-b', []);
                const state2 = registerAction(actionFunction, 'roc-package-b', state1);

                expect(state2.length)
                    .toBe(1);
                expect(state2[0].actions.length)
                    .toBe(2);
            });
        });

        describe('removeActions', () => {
            let originalState;

            beforeEach(() => {
                originalState = [{
                    project: false,
                    name: 'roc-package-a',
                    actions: [{
                        action: () => {},
                        extension: 'roc-package-web',
                        hook: 'some-hook',
                        description: 'a description',
                        post: () => {},
                    }],
                }, {
                    project: false,
                    name: 'roc-package-b',
                    actions: [{
                        action: () => {},
                        extension: undefined,
                        hook: undefined,
                        description: undefined,
                        post: undefined,
                    }, {
                        action: () => {},
                        extension: 'roc-package-web',
                        hook: 'some-hook',
                        description: 'a description',
                        post: () => {},
                    }],
                }];
            });

            it('should throw if no extension name is provided', () => {
                expect(removeActions(originalState)).toThrow(/specify the extension/);
            });

            it('should throw if state is empty', () => {
                expect(() => removeActions([])('roc-package-b')).toThrow(/No actions/);
            });

            it('should remove all actions correctly from an extension', () => {
                const newState = removeActions(originalState)('roc-package-b');

                expect(newState).toEqual([{
                    project: false,
                    name: 'roc-package-a',
                    actions: [{
                        action: () => {},
                        extension: 'roc-package-web',
                        hook: 'some-hook',
                        description: 'a description',
                        post: () => {},
                    }],
                }]);
            });

            it('should remove specific actions matching a hook from an extension', () => {
                const newState = removeActions(originalState)('roc-package-b', 'some-hook');

                expect(newState).toEqual([{
                    project: false,
                    name: 'roc-package-a',
                    actions: [{
                        action: () => {},
                        extension: 'roc-package-web',
                        hook: 'some-hook',
                        description: 'a description',
                        post: () => {},
                    }],
                }, {
                    project: false,
                    name: 'roc-package-b',
                    actions: [{
                        action: () => {},
                        extension: undefined,
                        hook: undefined,
                        description: undefined,
                        post: undefined,
                    }],
                }]);
            });
        });
    });
});
