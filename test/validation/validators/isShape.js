import expect from 'expect';
import stripAnsi from 'strip-ansi';

import isArray from '../../../src/validation/validators/isArray';
import isObject from '../../../src/validation/validators/isObject';
import isPath from '../../../src/validation/validators/isPath';
import isShape from '../../../src/validation/validators/isShape';
import notEmpty from '../../../src/validation/validators/notEmpty';
import required from '../../../src/validation/validators/required';
import toObject from '../../../src/converters/toObject';

describe('validators', () => {
    describe('isShape', () => {
        it('should return throw if no shape is provided', () => {
            expect(() => isShape())
                .toThrow('isShape validator requires that a shape object is defined.');

            expect(() => isShape({}))
                .toThrow('isShape validator requires that a shape object is defined.');
        });

        it('should validate null and undefined as valid', () => {
            expect(isShape({ a: /a/ })(null))
                .toBe(true);

            expect(isShape({ a: /a/ })(undefined))
                .toBe(true);
        });

        it('should return info object if requested', () => {
            const validator = () => ({
                type: 'Type',
                required: false,
                canBeEmpty: true,
            });

            expect(isShape({
                a: validator,
                b: required(notEmpty(isPath)),
                c: isArray(notEmpty(isPath)),
                d: isShape({
                    e: isPath,
                }),
            })(null, true))
                .toEqual({
                    type: '{ a: [?Type], b: <Filepath>, c: [?Array([Filepath])], d: [?{ e: [?Filepath] }] }',
                    required: false,
                    canBeEmpty: true,
                    converter: toObject,
                    unmanagedObject: false,
                });
        });

        it('should return error if value is not a plain object', () => {
            expect(isShape({ a: /a/ })([]))
                .toInclude('Was not an object and can therefore not have a shape!');
        });

        it('should validate a missing key', () => {
            expect(isShape({ a: required(() => true) })({ a: undefined }))
                .toEqual({ key: 'a', message: 'A value was required but none was given!', value: undefined });
        });

        it('should error on undefined keys', () => {
            expect(stripAnsi(isShape({ a: () => true })({ b: undefined, c: undefined })))
                .toEqual(
                    'Unknown propertys where found, make sure this is correct.\n' +
                    'Did not understand b - Did you mean a\n' +
                    'Did not understand c - Did you mean a'
                );
        });

        it('should not error on undefined keys when strict is false', () => {
            expect(isShape({ a: () => true }, { strict: false })({ b: undefined }))
                .toBe(true);
        });

        it('should validate complex shape as valid', () => {
            expect(isShape({
                a: isShape({
                    b: isArray(isPath),
                }),
                c: isObject(isPath),
            })({
                a: {
                    b: ['/some/path'],
                },
                c: {
                    d: '',
                },
            })).toBe(true);
        });

        it('should validate complex shape as invalid', () => {
            expect(isShape({
                a: isShape({
                    b: isArray(isPath),
                }),
                c: isObject(isPath),
            })({
                a: {
                    b: true,
                },
                c: {
                    d: '',
                },
            })).toEqual({ key: 'a.b', message: 'Was not an array!', value: true });
        });
    });
});
