import expect from 'expect';

import isArray from '../../../src/validation/validators/isArray';
import toArray from '../../../src/converters/toArray';

describe('roc', () => {
    describe('validators', () => {
        describe('isArray', () => {
            it('should return a wrapped validator', () => {
                expect(isArray())
                    .toBeA('function');
            });

            it('should return infoObject if requested', () => {
                const validator = () => {
                    return {
                        type: 'Type',
                        required: false
                    };
                };

                expect(isArray(validator)(null, true))
                    .toEqual({
                        type: '[Type]',
                        required: false,
                        canBeEmpty: true,
                        converter: toArray()
                    });
            });

            it('should return error if value is not an array', () => {
                expect(isArray()('string'))
                    .toInclude('not an array');
            });

            it('should validate an array correctly', () => {
                expect(isArray(() => true)([1]))
                    .toBe(true);
            });

            it('should validate if no validator is given and it is an array', () => {
                expect(isArray()([]))
                    .toBe(true);
            });

            it('should validate if value is undefined or null', () => {
                expect(isArray()(undefined))
                    .toBe(true);
            });
        });
    });
});
