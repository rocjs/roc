import expect from 'expect';

import { toRegExp } from 'roc-converters';

import isRegExp from '../src/isRegExp';

describe('validators', () => {
    describe('isRegExp', () => {
        it('should return info object if requested', () => {
            expect(isRegExp(null, true))
                .toEqual({
                    type: 'RegExp',
                    required: false,
                    canBeEmpty: null,
                    converter: toRegExp,
                    unmanagedObject: false,
                });
        });

        it('should validate a RegExp correctly', () => {
            expect(isRegExp(/abc/))
                .toBe(true);
        });

        it('should return error if value is not a RegExp', () => {
            expect(isRegExp('/abc/'))
                .toInclude('not a RegExp');
        });
    });
});
