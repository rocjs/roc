import expect from 'expect';

import keyboardDistance from '../src/keyboardDistance';

describe('helpers', () => {
    describe('keyboardDistance', () => {
        it('should throw error if first argument is not a single character', () => {
            expect(() => keyboardDistance('hello'))
                .toThrow();
        });

        it('should give back the same character if it´s one of the possible', () => {
            expect(keyboardDistance('g', ['a', 'f', 'd', 'r', 'g', 'v'])).toBe('g');
        });

        it('should give back the clostest one', () => {
            expect(keyboardDistance('g', ['a', 'f', 'd', 'e', 'w'])).toBe('f');
        });
    });
});
