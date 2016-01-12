import expect from 'expect';

import {
    isArray,
    isObject,
    isArrayOrSingle,
    isString,
    isBoolean,
    isInteger,
    isPath,
    oneOf,
    required
} from '../../src/validation/validators';

describe('roc', () => {
    describe('validation', () => {
        describe('validators', () => {
            describe('isArray', () => {
                it('should return a wrapped validator', () => {
                    expect(isArray())
                        .toBeA('function');
                });

                it('should return info object if requested', () => {
                    const validator = () => {
                        return {
                            type: 'Type',
                            required: false
                        };
                    };

                    expect(isArray(validator)(null, true))
                        .toEqual({
                            type: '[ Type ]',
                            required: false
                        });
                });

                it('should return error if value is not an array', () => {
                    expect(isArray()('string'))
                        .toInclude('not an array');
                });

                it('should validate an array correctly', () => {
                    expect(isArray(() => true)([1]))
                        .toBe(true);
                });

                it('should validate if no validator is given and it is an array', () => {
                    expect(isArray()([]))
                        .toBe(true);
                });
            });

            describe('isObject', () => {
                it('should return a wrapped validator', () => {
                    expect(isObject())
                        .toBeA('function');
                });

                it('should return info object if requested', () => {
                    const validator = () => {
                        return {
                            type: 'Type',
                            required: false
                        };
                    };

                    expect(isObject(validator)(null, true))
                        .toEqual({
                            type: '{ Type }',
                            required: false
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

            describe('isArrayOrSingle', () => {
                it('should return a wrapped validator', () => {
                    expect(isArrayOrSingle())
                        .toBeA('function');
                });

                it('should return info object if requested', () => {
                    const validator = () => {
                        return {
                            type: 'Type',
                            required: false
                        };
                    };

                    expect(isArrayOrSingle(validator)(null, true))
                        .toEqual({
                            type: 'Type / [ Type ]',
                            required: false
                        });
                });

                it('should validate a single value correctly', () => {
                    expect(isArrayOrSingle(() => true)(1))
                        .toBe(true);
                });

                it('should validate an array correctly', () => {
                    const spy = expect.createSpy().andReturn(true);
                    expect(isArrayOrSingle(spy)([1, 2, 3]))
                        .toBe(true);
                    expect(spy.calls.length).toBe(3);
                });

                it('should fail fast if a single value in the array is invalid', () => {
                    const spy = expect.createSpy().andCall((input) => input > 1);
                    expect(isArrayOrSingle(spy)([1, 2, 3]))
                        .toBe(false);
                    expect(spy.calls.length).toBe(1);
                });
            });

            describe('isString', () => {
                it('should return info object if requested', () => {
                    expect(isString(null, true))
                        .toEqual({
                            type: 'String',
                            required: false
                        });
                });

                it('should validate a string correctly', () => {
                    expect(isString('123'))
                        .toBe(true);
                });

                it('should return error if value is not a string', () => {
                    expect(isString(123))
                        .toInclude('not a string');
                });
            });

            describe('isBoolean', () => {
                it('should return info object if requested', () => {
                    expect(isBoolean(null, true))
                        .toEqual({
                            type: 'Boolean',
                            required: false
                        });
                });

                it('should validate a boolean correctly', () => {
                    expect(isBoolean(false))
                        .toBe(true);
                });

                it('should return error if value is not a boolean', () => {
                    expect(isBoolean(1))
                        .toInclude('not a boolean');
                });
            });

            describe('isInteger', () => {
                it('should return info object if requested', () => {
                    expect(isInteger(null, true))
                        .toEqual({
                            type: 'Integer',
                            required: false
                        });
                });

                it('should validate a integer correctly', () => {
                    expect(isInteger(1))
                        .toBe(true);
                });

                it('should return error if value is not a integer', () => {
                    expect(isInteger('1'))
                        .toInclude('not an integer');
                });
            });

            describe('isPath', () => {
                it('should return info object if requested', () => {
                    expect(isPath(null, true))
                        .toEqual({
                            type: 'Filepath',
                            required: false
                        });
                });

                it('should validate a filepath correctly', () => {
                    expect(isPath('/some/path'))
                        .toBe(true);
                });

                it('should return error if value is not a filepath', () => {
                    expect(isPath(1))
                        .toInclude('not a filepath');
                });
            });

            describe('oneOf', () => {
                it('should return a wrapped validator', () => {
                    expect(oneOf(isString))
                        .toBeA('function');
                });

                it('should return info object if requested', () => {
                    const validator = () => {
                        return {
                            type: 'Type',
                            required: false
                        };
                    };

                    expect(oneOf(validator, validator, validator)(null, true))
                        .toEqual({
                            type: 'Type / Type / Type',
                            required: false
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
                    expect(oneOf)
                        .withArgs()
                        .toThrow();
                });
            });

            describe('require', () => {
                it('should return a wrapped validator', () => {
                    expect(required())
                        .toBeA('function');
                });

                it('should return info object if requested', () => {
                    const validator = () => {
                        return {
                            type: 'Type',
                            required: false
                        };
                    };

                    expect(required(validator)(null, true))
                        .toEqual({
                            type: 'Type',
                            required: true
                        });
                });

                it('should return error if no value is provided', () => {
                    expect(required(isInteger)())
                        .toInclude('value was required but none was given');
                });

                it('should validate correctly', () => {
                    expect(required(isInteger)(1))
                        .toBe(true);
                });

                it('should validate if no validator is given and it is an array', () => {
                    expect(required()(1))
                        .toBe(true);
                });

                it('should invalidate empty values', () => {
                    expect(required(isString)(''))
                        .toInclude('value was required but none was given');

                    expect(required(isString)({}))
                        .toInclude('value was required but none was given');

                    expect(required(isString)([]))
                        .toInclude('value was required but none was given');
                });
            });
        });
    });
});
