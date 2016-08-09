import expect from 'expect';

describe('roc', () => {
    describe('commands', () => {
        describe('helpers', () => {
            describe('defaultPrompt', () => {
                const prompt = require('../../../src/index.js').defaultPrompt;

                it('should have a property named defaultPrompt that is an array', () => {
                    expect(prompt).toBeAn(Array);
                });
            });
        });
    });
});
