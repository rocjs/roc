import expect from 'expect';

import merge from '../src/merge';

describe('helpers', () => {
    describe('merge', () => {
        it('should call merge simple example correctly', () => {
            expect(merge({
                a: 2,
                b: {
                    f: 5,
                },
            }, {
                a: 4,
                b: {
                    g: 2,
                },
            })).toEqual({
                a: 4,
                b: {
                    f: 5,
                    g: 2,
                },
            });
        });
    });
});
