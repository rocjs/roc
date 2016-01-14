import expect from 'expect';

describe('roc', () => {
    describe('bin', () => {
        describe('helpers', () => {
            describe('defaultPrompt', () => {
                const prompt = require('../../../src/bin/commands/helpers/default-prompt');

                it('should have a property named defaultPrompt that is an array', () => {
                    expect(prompt.defaultPrompt).toBeAn(Array);
                });
            });
        });
    });
});
