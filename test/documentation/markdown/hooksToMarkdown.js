import { join } from 'path';
import { readFileSync } from 'fs';

import expect from 'expect';

import hooksToMarkdown from '../../../src/documentation/markdown/hooksToMarkdown';

import getContext from './fixtures/getContext';

describe('documentation', () => {
    describe('markdown', () => {
        describe('hooksToMarkdown', () => {
            it('should correctly format hooks when no hooks', () => {
                expect(hooksToMarkdown('name'))
                    .toBe('# Hooks for `name`\n\n__No hooks available.__\n');
            });

            it('should correctly format hooks for project empty', () => {
                const project = join(__dirname, 'fixtures', 'projects', 'empty');
                const context = getContext(project);

                expect(hooksToMarkdown('empty', context.hooks))
                    .toBe(readFileSync(join(project, 'docs', 'Hooks.md'), 'utf8'));
            });

            it('should correctly format hooks for project complex', () => {
                const project = join(__dirname, 'fixtures', 'projects', 'complex');
                const context = getContext(project);

                expect(hooksToMarkdown('complex', context.hooks))
                    .toBe(readFileSync(join(project, 'docs', 'Hooks.md'), 'utf8'));
            });
        });
    });
});
