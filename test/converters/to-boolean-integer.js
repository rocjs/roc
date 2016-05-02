import expect from 'expect';

import toBooleanInteger from '../../src/converters/to-boolean-integer';

describe('roc', () => {
    describe('converters', () => {
        describe('toBooleanInteger', () => {
            it('should pass the value through if it already is a boolean', () => {
                expect(toBooleanInteger(true)).toEqual(true);
            });

            it('should pass the value through if it already is an integer', () => {
                expect(toBooleanInteger(1000)).toEqual(1000);
            });

            it('should convert string "true" to boolean', () => {
                expect(toBooleanInteger('true')).toEqual(true);
            });

            it('should convert string "false" to boolean', () => {
                expect(toBooleanInteger('false')).toEqual(false);
            });

            it('should convert string (number) to integer', () => {
                expect(toBooleanInteger('1000')).toEqual(1000);
            });
        });
    });
});
