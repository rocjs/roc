import expect from 'expect';

describe('roc', () => {
    describe('bin', () => {
        describe('helpers', () => {
            describe('defaultPrompt', () => {
                const prompt = require('../../../src/bin/commands/helpers/default-prompt');

                it('property defaultPrompt should return an array', () => {
                    expect(prompt.defaultPrompt).toBeAn(Array);
                });
            });
        });
    });
});
