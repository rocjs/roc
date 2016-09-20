import expect from 'expect';

import isRegExp from '../../../src/validation/validators/isRegExp';
import toRegExp from '../../../src/converters/toRegExp';

describe('validators', () => {
    describe('isRegExp', () => {
        it('should return info object if requested', () => {
            expect(isRegExp(null, true))
                .toEqual({
                    type: 'RegExp',
                    required: false,
                    canBeEmpty: null,
                    converter: toRegExp,
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
