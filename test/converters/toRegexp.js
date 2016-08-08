import expect from 'expect';

import toRegExp from '../../src/converters/toRegexp';

describe('roc', () => {
    describe('converters', () => {
        describe('toRegExp', () => {
            it('should pass the value through if it already is a RegExp', () => {
                const regexp = /abc/;
                expect(toRegExp(regexp)).toEqual(regexp);
            });

            it('should convert a string to regexp, without flags and slashes', () => {
                expect(toRegExp('abc')).toEqual(/abc/);
            });

            it('should convert a string to regexp, without flags', () => {
                expect(toRegExp('/abc/')).toEqual(/abc/);
            });

            it('should convert a string to regexp', () => {
                expect(toRegExp('/abc/g')).toEqual(/abc/g);
            });

            it('should convert a string to regexp that only have a leading slash', () => {
                expect(toRegExp('/abc')).toEqual(/abc/);
            });

            it('should convert a string to regexp that only have a trailing slash', () => {
                expect(toRegExp('abc/')).toEqual(/abc/);
            });
        });
    });
});
