import { join } from 'path';
import { readFileSync } from 'fs';

import expect from 'expect';

import settingsToMarkdown from '../../../src/documentation/markdown/settingsToMarkdown';
import defaultCommands from '../../../src/commands';

import getContext from './fixtures/getContext';

describe('documentation', () => {
    describe('markdown', () => {
        describe('settingsToMarkdown', () => {
            it('should correctly format settings when no settings', () => {
                expect(settingsToMarkdown('name'))
                    .toBe('# Settings for `name`\n\n__No settings available.__\n');
            });

            it('should correctly format settings for project empty', () => {
                const project = join(__dirname, 'fixtures', 'projects', 'empty');
                const context = getContext(project, defaultCommands);

                expect(settingsToMarkdown('empty', context.extensionConfig, context.meta))
                    .toEqual(readFileSync(join(project, 'docs', 'Settings.md'), 'utf8'));
            });

            it('should correctly format settings for project complex', () => {
                const project = join(__dirname, 'fixtures', 'projects', 'complex');
                const context = getContext(project, defaultCommands);

                expect(settingsToMarkdown('complex', context.extensionConfig, context.meta))
                    .toEqual(readFileSync(join(project, 'docs', 'Settings.md'), 'utf8'));
            });
        });
    });
});
