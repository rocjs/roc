import expect from 'expect';

import toArray from '../src/toArray';
import toInteger from '../src/toInteger';

describe('converters', () => {
    describe('toArray', () => {
        it('should convert input to array without nested converter', () => {
            expect(toArray()(['1', '2', '3'])).toEqual(['1', '2', '3']);
            expect(toArray()('1,2,3')).toEqual(['1', '2', '3']);
        });

        it('should convert input to array with nested converter', () => {
            expect(toArray(toInteger)('1,2,3')).toEqual([1, 2, 3]);
        });
    });
});
