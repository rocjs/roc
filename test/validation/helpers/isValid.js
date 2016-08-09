import expect from 'expect';

import isValid from '../../../src/validation/helpers/isValid';

describe('roc', () => {
    describe('validation helpers', () => {
        describe('isValid', () => {
            it('should run the validator on the value if a function', () => {
                const spy = expect.createSpy();
                isValid('value', spy);
                expect(spy).toHaveBeenCalledWith('value');
            });

            it('should return true if value match the RegExp', () => {
                expect(isValid('value', /\w/))
                    .toBe(true);
            });

            it('should return error message if value does NOT match the RegExp', () => {
                expect(isValid('value', /\d/))
                    .toBeA('string');
            });

            it('should throw if validator is defined but not a function or RegExp', () => {
                expect(isValid)
                    .withArgs('value', 2)
                    .toThrow();
            });

            it('should return true if validator is undefined', () => {
                expect(isValid('value'))
                    .toBe(true);
            });
        });
    })
})
