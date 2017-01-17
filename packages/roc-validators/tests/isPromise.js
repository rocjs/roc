import expect from 'expect';

import isPromise from '../src/isPromise';

describe('validators', () => {
    describe('isPromise', () => {
        it('should return info object if requested', () => {
            expect(isPromise(null, true))
                .toEqual({
                    type: 'Promise',
                    required: false,
                    canBeEmpty: null,
                    converter: undefined,
                    unmanagedObject: false,
                });
        });

        it('should validate a Promise correctly', () => {
            expect(isPromise(Promise.resolve()))
                .toBe(true);
        });

        it('should return error if value is not a Promise', () => {
            expect(isPromise(() => {}))
                .toInclude('not a Promise');
        });
    });
});
