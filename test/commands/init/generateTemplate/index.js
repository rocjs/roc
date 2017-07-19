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

            it('should always supply destDirName and inPlace data to templates', () => {
                const outputDir = join(__dirname, '_output', 'alwaysSet');
                generateTemplate('hey', join(__dirname, 'fixtures', 'alwaysSet'), outputDir, () => {});

                return answerPrompts([
                    'something',
                ])
                    .then(() => readFile(join(outputDir, 'test-input')))
                    .then(rendered => {
                        expect(rendered).toBe(
                            'something\n' +
                            join('test', 'commands', 'init', 'generateTemplate', '_output', 'alwaysSet') + '\n' +
                            'false\n'
                        );
                    });
            });

            it('should allow to use previous answers when building prompts', () => {
                const outputDir = join(__dirname, '_output', 'previousAnswers');
                generateTemplate('hey', join(__dirname, 'fixtures', 'previousAnswers'), outputDir, () => {});

                return answerPrompts([
                    'something',
                    '',
                ])
                    .then(() => readFile(join(outputDir, 'test-input')))
                    .then(rendered => {
                        expect(rendered).toBe(
                            'something\n' +
                            'this should be a default\n'
                        );
                    });
            });
        });
    });
});
