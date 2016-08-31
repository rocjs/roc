import expect from 'expect';

import toCliOption from '../../../src/documentation/helpers/toCliOption';

describe('documentation', () => {
    describe('helpers', () => {
        describe('toCliOption', () => {
            it('should return a option correct', () => {
                expect(toCliOption(['build', 'option2'])).toBe('--build-option2');
            });
        });
    });
});
