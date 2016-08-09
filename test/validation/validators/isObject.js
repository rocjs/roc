import expect from 'expect';

import isArray from '../../../src/validation/validators/isArray';
import isObject from '../../../src/validation/validators/isObject';
import isPath from '../../../src/validation/validators/isPath';
import toObject from '../../../src/converters/toObject';

describe('roc', () => {
    describe('validators', () => {
        describe('isObject', () => {
            it('should return a wrapped validator', () => {
                expect(isObject())
                    .toBeA('function');
            });

            it('should return info object if requested', () => {
                const validator = () => {
                    return {
                        type: 'Type',
                        required: false,
                        canBeEmpty: true,
                        converter: toObject
                    };
                };

                expect(isObject(validator)(null, true))
                    .toEqual({
                        type: '{Type}',
                        required: false,
                        canBeEmpty: true,
                        converter: toObject
                    });
            });

            it('should return error if value is not a plain object', () => {
                expect(isObject()([]))
                    .toInclude('not an object');
            });

            it('should validate a object correctly', () => {
                expect(isObject(() => true)({}))
                    .toBe(true);
            });

            it('should validate if no validator is given and it is a plain object', () => {
                expect(isObject()({}))
                    .toBe(true);
            });

            it('should validate complex object as valid', () => {
                expect(isObject(isArray(isPath))({ a: ['/some/path'] }))
                    .toBe(true);
            });
        });
    });
});
