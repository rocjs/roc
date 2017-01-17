import expect from 'expect';

import stripAnsi from 'strip-ansi';

import getSuggestions from '../src/getSuggestions';

describe('helpers', () => {
    describe('getSuggestions', () => {
        it('should suggest the best alternative spelling', () => {
            const suggestion = getSuggestions(['te'], ['tea', 'test', 'testing']);
            expect(stripAnsi(suggestion)).toEqual('Did not understand te - Did you mean tea');
        });

        it('should inform when there is no possible alternative', () => {
            const suggestion = getSuggestions(['te'], ['testing']);
            expect(stripAnsi(suggestion)).toEqual('Did not understand te');
        });

        it('should add -- infront of suggestions if command is enabled', () => {
            const suggestion = getSuggestions(['te'], ['test', 'tea', 'testing'], '--');
            expect(stripAnsi(suggestion)).toEqual('Did not understand --te - Did you mean --tea');
        });
    });
});
