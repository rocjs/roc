import expect from 'expect';

import toBooleanOrInteger from '../../src/converters/to-boolean-or-integer';

describe('roc', () => {
    describe('converters', () => {
        describe('toBooleanOrInteger', () => {
            it('should pass the value through if it already is a boolean', () => {
                expect(toBooleanOrInteger(true)).toEqual(true);
            });

            it('should pass the value through if it already is an integer', () => {
                expect(toBooleanOrInteger(1000)).toEqual(1000);
            });

            it('should convert string "true" to boolean', () => {
                expect(toBooleanOrInteger('true')).toEqual(true);
            });

            it('should convert string "false" to boolean', () => {
                expect(toBooleanOrInteger('false')).toEqual(false);
            });

            it('should convert string (number) to integer', () => {
                expect(toBooleanOrInteger('1000')).toEqual(1000);
            });
        });
    });
});
