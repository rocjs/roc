import expect from 'expect';

import toString from '../../src/converters/toString';

describe('converters', () => {
    describe('toString', () => {
        it('should convert input to string', () => {
            expect(toString(true)).toEqual('true');
            expect(toString(123)).toEqual('123');

            expect(toString('true')).toEqual('true');
        });
    });
});
