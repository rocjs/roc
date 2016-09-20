import expect from 'expect';

import isArray from '../../../src/validation/validators/isArray';
import isObject from '../../../src/validation/validators/isObject';
import isString from '../../../src/validation/validators/isString';
import required from '../../../src/validation/validators/required';

describe('validators', () => {
    describe('require', () => {
        it('should return a wrapped validator', () => {
            expect(required())
                .toBeA('function');
        });

        it('should return info object if requested', () => {
            const validator = () => ({
                type: 'Type',
                required: false,
                canBeEmpty: null,
            });

            expect(required(validator)(null, true))
                .toEqual({
                    type: 'Type',
                    required: true,
                    canBeEmpty: null,
                    converter: undefined,
                });
        });

        it('should validate correctly when value is provided', () => {
            expect(required()(true))
                .toBe(true);

            expect(required(isString)(''))
                .toBe(true);

            expect(required(isObject())({}))
                .toBe(true);

            expect(required(isArray())([]))
                .toBe(true);
        });

        it('should return error if no value is provided', () => {
            expect(required()())
                .toInclude('A value was required but none was given!');

            expect(required(isString)())
                .toInclude('A value was required but none was given!');

            expect(required(isObject())())
                .toInclude('A value was required but none was given!');

            expect(required(isArray())())
                .toInclude('A value was required but none was given!');
        });
    });
});
