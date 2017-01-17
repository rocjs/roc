import expect from 'expect';

import { toString } from 'roc-converters';

import isString from '../src/isString';

describe('validators', () => {
    describe('isString', () => {
        it('should return info object if requested', () => {
            expect(isString(null, true))
                .toEqual({
                    type: 'String',
                    required: false,
                    canBeEmpty: true,
                    converter: toString,
                    unmanagedObject: false,
                });
        });

        it('should validate a string correctly', () => {
            expect(isString('123'))
                .toBe(true);
        });

        it('should return error if value is not a string', () => {
            expect(isString(123))
                .toInclude('not a string');
        });

        it('should allow undefined and null', () => {
            expect(isString(null))
                .toBe(true);

            expect(isString(undefined))
                .toBe(true);
        });
    });
});
