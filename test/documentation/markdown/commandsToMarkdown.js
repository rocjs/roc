import { join } from 'path';
import { readFileSync } from 'fs';

import expect from 'expect';

import commandsToMarkdown from '../../../src/documentation/markdown/commandsToMarkdown';
import defaultCommands from '../../../src/commands';

import getContext from './fixtures/getContext';

describe('documentation', () => {
    describe('markdown', () => {
        describe('commandsToMarkdown', () => {
            it('should correctly format commands when no commands', () => {
                expect(commandsToMarkdown('name'))
                    .toBe('# Commands for `name`\n\n__No commands available.__\n');
            });

            it('should correctly format commands for project empty', () => {
                const project = join(__dirname, 'fixtures', 'projects', 'empty');
                const context = getContext(project, defaultCommands);

                expect(commandsToMarkdown('empty', context.extensionConfig, context.commands, '/docs/Settings.md'))
                    .toEqual(readFileSync(join(project, 'docs', 'Commands.md'), 'utf8'));
            });

            it('should correctly format commands for project complex', () => {
                const project = join(__dirname, 'fixtures', 'projects', 'complex');
                const context = getContext(project, defaultCommands);

                expect(commandsToMarkdown('complex', context.extensionConfig, context.commands, '/docs/Settings.md'))
                    .toEqual(readFileSync(join(project, 'docs', 'Commands.md'), 'utf8'));
            });
        });
    });
});
