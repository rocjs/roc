import expect from 'expect';

describe('roc', () => {
    describe('bin', () => {
        describe('helpers', () => {
            describe('defaultPrompt', () => {
                const prompt = require('../../../src/bin/commands/helpers/default-prompt');

                it('should return an array on defaultPrompt', () => {
                    expect(prompt.defaultPrompt).toBeAn(Array);
                });
            });
        });
    });
});
