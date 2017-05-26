import { join } from 'path';
import { readFileSync } from 'fs';

import expect from 'expect';
import mute from 'mute';

import generateTemplate from '../../../../src/commands/init/generateTemplate/index';

function readFile(path) {
    return readFileSync(path).toString('utf-8');
}

function wait(amount) {
    return new Promise(resolve => setTimeout(resolve, amount));
}

function answerPrompts(answers) {
    const unmute = mute();
    return answers
        .map(answer => () => {
            answer.split('').forEach(letter => process.stdin.emit('keypress', letter));
            process.stdin.emit('keypress', null, {
                name: 'enter',
            });
        })
        .reduce((waiting, answer) => waiting.then(answer).then(() => wait(100)), wait(200))
        .then(unmute);
}

describe('commands', () => {
    describe('init', () => {
        describe('generateTemplate', () => {
            it('should generate output based on template and answers', () => {
                const outputDir = join(__dirname, '_output', 'simple');
                generateTemplate('hey', join(__dirname, 'fixtures', 'simple'), outputDir, () => {});

                return answerPrompts([
                    'something',
                    'user',
                    'provided',
                ])
                    .then(() => readFile(join(outputDir, 'test-input')))
                    .then(rendered => {
                        expect(rendered).toBe(
                            'something\n' +
                            'user\n' +
                            'provided\n'
                        );
                    });
            });
        });
    });
});
