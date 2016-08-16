import expect from 'expect';

import toInteger from '../../src/converters/toInteger';

describe('converters', () => {
    describe('toInteger', () => {
        it('should convert input to integer', () => {
            expect(toInteger(123)).toEqual(123);
            expect(toInteger('123')).toEqual(123);
            expect(toInteger('123.123')).toEqual(123);
        });

        it('should convert input to undefined if unsupported', () => {
            expect(toInteger('asd')).toEqual(NaN);
            expect(toInteger(true)).toEqual(NaN);
        });
    });
});
