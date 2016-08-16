import expect from 'expect';

import toBoolean from '../../src/converters/toBoolean';

describe('converters', () => {
    describe('toBoolean', () => {
        it('should convert input to boolean', () => {
            expect(toBoolean(true)).toEqual(true);
            expect(toBoolean(false)).toEqual(false);

            expect(toBoolean('true')).toEqual(true);
            expect(toBoolean('false')).toEqual(false);
        });

        it('should convert input to undefined if unsupported', () => {
            expect(toBoolean('asd')).toEqual(undefined);
            expect(toBoolean(1)).toEqual(undefined);
        });
    });
});
