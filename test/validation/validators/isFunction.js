import expect from 'expect';

import isFunction from '../../../src/validation/validators/isFunction';

describe('validators', () => {
    describe('toFunction', () => {
        it('should return infoObject if requested', () => {
            expect(isFunction(null, true))
                .toEqual({
                    type: 'Function',
                    required: false,
                    canBeEmpty: null,
                    converter: undefined,
                    unmanagedObject: false,
                });
        });

        it('should validate a function correctly', () => {
            expect(isFunction(() => {}))
                .toBe(true);
        });

        it('should validate a function correctly when undefined', () => {
            expect(isFunction(undefined))
                .toBe(true);
        });

        it('should return error if value is not a function', () => {
            expect(isFunction(1))
                .toInclude('not a function');
        });

        it('should allow undefined and null', () => {
            expect(isFunction(null))
                .toBe(true);

            expect(isFunction(undefined))
                .toBe(true);
        });
    });
});
