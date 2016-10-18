import expect from 'expect';

import isBoolean from '../../../src/validation/validators/isBoolean';
import isInteger from '../../../src/validation/validators/isInteger';
import isString from '../../../src/validation/validators/isString';
import oneOf from '../../../src/validation/validators/oneOf';

describe('validators', () => {
    describe('oneOf', () => {
        it('should return a wrapped validator', () => {
            expect(oneOf(isString))
                .toBeA('function');
        });

        it('should return info object if requested', () => {
            const validator = () => ({
                type: 'Type',
                required: false,
            });

            expect(oneOf(validator, validator, validator)(null, true))
                .toEqual({
                    type: 'Type / Type / Type',
                    required: false,
                    canBeEmpty: null,
                    converter: undefined,
                    unmanagedObject: false,
                });
        });

        it('should return error if value is invalid', () => {
            expect(oneOf(isInteger, isBoolean)('true'))
                .toEqual('Was not any of the possible types:\n\nInteger\nBoolean');
        });

        it('should validate correctly', () => {
            expect(oneOf(isInteger, isBoolean)(1))
                .toBe(true);
        });

        it('should succeed fast', () => {
            const spy = expect.createSpy().andReturn(true);
            oneOf(spy, spy, spy)(1);

            expect(spy.calls.length).toBe(1);
        });

        it('should throw if no validator is given', () => {
            expect(() => oneOf())
                .toThrow();
        });
    });
});
