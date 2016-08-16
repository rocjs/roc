import expect from 'expect';

import toObject from '../../src/converters/toObject';

describe('converters', () => {
    describe('toObject', () => {
        it('should convert input to object', () => {
            expect(toObject({ a: 1, b: 'hello' })).toEqual({ a: 1, b: 'hello' });
            expect(toObject('{"a": 1, "b": "hello"}')).toEqual({ a: 1, b: 'hello' });
        });

        it('should manage invalid input', () => {
            expect(toObject('1,2,3')).toEqual(undefined);
        });
    });
});
