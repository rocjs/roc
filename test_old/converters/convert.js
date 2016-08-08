import expect from 'expect';

import { toArray, toRegExp, toBoolean, toInteger, toObject, convert } from '../../src/converters';

describe('roc', () => {
    describe('converters', () => {
        describe('convert', () => {
            it('should convert the value toBoolean', () => {
                expect(convert(toBoolean, toInteger)('true')).toEqual(true);
            });

            it('should convert the value toInteger', () => {
                expect(convert(toBoolean, toInteger)('100')).toEqual(100);

                expect(convert(toBoolean, toInteger)(100)).toEqual(100);
            });

            it('should convert the value toArray', () => {
                expect(convert(toBoolean, toArray())('100,100,100')).toEqual(['100', '100', '100']);

                expect(convert(toBoolean, toArray())('[100, 100, 100]')).toEqual([100, 100, 100]);
            });

            it('should convert the value toBoolean', () => {
                expect(convert(toBoolean, toArray, toRegExp, toInteger, toObject)('true')).toEqual(true);

                expect(convert(toBoolean, toArray, toRegExp, toInteger, toObject)('false')).toEqual(false);
            });

            it('should convert the value toBoolean or toInteger', () => {
                expect(convert(toBoolean, toInteger)('true')).toEqual(true);

                expect(convert(toBoolean, toInteger)('100')).toEqual(100);
            });

            it('should return undefined if it could not be converted', () => {
                expect(convert(toBoolean, toInteger)('{}')).toEqual(undefined);
            });

            it('should be possible to define a custom converter', () => {
                expect(convert((input) => {
                    if (input === 'custom') {
                        return true;
                    }

                    return false;
                })('custom')).toEqual(true);
            });
        });
    });
});
