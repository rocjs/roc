import expect from 'expect';

import isBoolean from '../../../src/validation/validators/isBoolean';
import toBoolean from '../../../src/converters/toBoolean';

describe('roc', () => {
    describe('validators', () => {
        describe('isBoolean', () => {
            it('should return infoObject if requested', () => {
                expect(isBoolean(null, true))
                    .toEqual({
                        type: 'Boolean',
                        required: false,
                        canBeEmpty: null,
                        converter: toBoolean
                    });
            });

            it('should validate a boolean correctly', () => {
                expect(isBoolean(false))
                    .toBe(true);
            });

            it('should validate a boolean correctly when undefined', () => {
                expect(isBoolean(undefined))
                    .toBe(true);
            });

            it('should return error if value is not a boolean', () => {
                expect(isBoolean(1))
                    .toInclude('not a boolean');
            });

            it('should allow undefined and null', () => {
                expect(isBoolean(null))
                    .toBe(true);

                expect(isBoolean(undefined))
                    .toBe(true);
            });
        });
    });
});
