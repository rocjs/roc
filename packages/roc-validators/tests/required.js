import expect from 'expect';

import isArray from '../src/isArray';
import isObject from '../src/isObject';
import isString from '../src/isString';
import required from '../src/required';

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
                    unmanagedObject: false,
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
