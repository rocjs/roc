import expect from 'expect';

import { toInteger } from 'roc-converters';

import isInteger from '../src/isInteger';

describe('validators', () => {
    describe('isInteger', () => {
        it('should return info object if requested', () => {
            expect(isInteger(null, true))
                .toEqual({
                    type: 'Integer',
                    required: false,
                    canBeEmpty: null,
                    converter: toInteger,
                    unmanagedObject: false,
                });
        });

        it('should validate a integer correctly', () => {
            expect(isInteger(1))
                .toBe(true);
        });

        it('should return error if value is not a integer', () => {
            expect(isInteger('1'))
                .toInclude('not an integer');
        });

        it('should allow undefined and null', () => {
            expect(isInteger(null))
                .toBe(true);

            expect(isInteger(undefined))
                .toBe(true);
        });
    });
});
