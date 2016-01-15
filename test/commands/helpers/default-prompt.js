import expect from 'expect';

describe('roc', () => {
    describe('commands', () => {
        describe('helpers', () => {
            describe('defaultPrompt', () => {
                const prompt = require('../../../src/commands/helpers/default-prompt');

                it('should have a property named defaultPrompt that is an array', () => {
                    expect(prompt.defaultPrompt).toBeAn(Array);
                });
            });
        });
    });
});
