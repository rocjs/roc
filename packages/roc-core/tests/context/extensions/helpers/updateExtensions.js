import expect from 'expect';

import updateExtensions from '../../../../src/context/extensions/helpers/updateExtensions';

describe('context', () => {
    describe('extensions', () => {
        describe('helpers', () => {
            describe('updateExtensions', () => {
                it('should update an object correctly', () => {
                    const current = {
                        a: {
                            value: true,
                            __extensions: [1, 2],
                        },
                        b: {
                            d: {
                                value: true,
                                __extensions: [2],
                            },
                            value: true,
                            __extensions: [1],
                        },
                    };
                    const old = {
                        a: {
                            __extensions: [1, 3],
                        },
                        b: {
                            c: {
                                __extensions: [4],
                            },
                            __extensions: [5],
                        },
                    };
                    expect(updateExtensions(current, old)).toEqual({
                        a: {
                            value: true,
                            __extensions: [1, 2, 3],
                        },
                        b: {
                            d: {
                                value: true,
                                __extensions: [2],
                            },
                            value: true,
                            __extensions: [1, 5],
                        },
                    });
                });
            });
        });
    });
});
