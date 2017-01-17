import expect, { createSpy } from 'expect';

import runPostInits from '../../../../src/context/extensions/steps/runPostInits';
import defaultState from '../../fixtures/defaultState';

describe('context', () => {
    describe('extensions', () => {
        describe('steps', () => {
            describe('runPostInits', () => {
                it('should return the inital state if no postInit has been registered', () => {
                    expect(runPostInits({ ...defaultState })).toEqual(defaultState);
                });

                it('should call registered postInit in the right order and return back the correct state', () => {
                    const order = [];
                    const mock1 = createSpy().andCall(() => { order.push(1); });
                    const mock2 = createSpy().andCall(() => { order.push(2); });
                    const mock3 = createSpy().andCall(() => { order.push(3); });

                    const state = {
                        ...defaultState,
                        temp: {
                            ...defaultState.temp,
                            postInits: [
                                { postInit: mock1, name: 'a' },
                                { postInit: mock2, name: 'b' },
                                { postInit: mock3, name: 'c' },
                            ],
                        },
                    };

                    expect(runPostInits(state)).toEqual(state);
                    expect(order).toEqual([3, 2, 1]);
                });
            });
        });
    });
});
