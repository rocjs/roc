import expect from 'expect';

import isArray from '../src/isArray';
import isObject from '../src/isObject';
import isString from '../src/isString';
import notEmpty from '../src/notEmpty';

describe('validators', () => {
    describe('notEmpty', () => {
        it('should return a wrapped validator', () => {
            expect(notEmpty())
                .toBeA('function');
        });

        it('should return infoObject if requested', () => {
            const validator = () => ({
                type: 'Type',
                canBeEmpty: false,
            });

            expect(notEmpty(validator)(null, true))
                .toEqual({
                    type: 'Type',
                    required: false,
                    canBeEmpty: false,
                    converter: undefined,
                    unmanagedObject: false,
                });
        });

        it('should validate correctly when value is provided', () => {
            expect(notEmpty()(true))
                .toBe(true);

            expect(notEmpty(isString)('a'))
                .toBe(true);

            expect(notEmpty(isObject())({ a: 1 }))
                .toBe(true);

            expect(notEmpty(isArray())([1]))
                .toBe(true);
        });

        it('should validate if no validator is given and it is an array', () => {
            expect(notEmpty()(1))
                .toBe(true);
        });

        it('should return error if no value is provided', () => {
            expect(notEmpty(isString)(''))
                .toInclude('The value is required to not be empty!');

            expect(notEmpty(isObject())({}))
                .toInclude('The value is required to not be empty!');

            expect(notEmpty(isArray())([]))
                .toInclude('The value is required to not be empty!');
        });
    });
});
