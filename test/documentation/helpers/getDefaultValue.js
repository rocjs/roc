import expect from 'expect';

import getDefaultValue from '../../../src/documentation/helpers/getDefaultValue';

describe('documentation', () => {
    describe('helpers', () => {
        describe('getDefaultValue', () => {
            it('should return null for undefined', () => {
                expect(getDefaultValue(undefined))
                    .toBe(undefined);
            });

            it('should return null as string', () => {
                expect(getDefaultValue(null))
                    .toBe('null');
            });

            it('should return RegExp as string', () => {
                expect(getDefaultValue(/abc/))
                    .toEqual('/abc/');
            });
        });
    });
});
