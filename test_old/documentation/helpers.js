import expect from 'expect';

import {
    pad,
    addPadding,
    toCliOption,
    getDefaultValue
} from '../../src/documentation/helpers';

describe('roc', () => {
    describe('documentation', () => {
        describe('helpers', () => {
            describe('pad', () => {
                it('should pad correctly', () => {
                    expect(pad(4, '-')).toBe('----');
                });
            });

            describe('addPadding', () => {
                it('should add correct spacing', () => {
                    expect(addPadding('Hello', 6)).toBe('Hello ');
                });
            });

            describe('toCliOption', () => {
                it('should return a runtime option correct', () => {
                    expect(toCliOption(['runtime', 'option1'])).toBe('--option1');
                });

                it('should return a "general" option correct', () => {
                    expect(toCliOption(['build', 'option2'])).toBe('--build-option2');
                });
            });

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
});
