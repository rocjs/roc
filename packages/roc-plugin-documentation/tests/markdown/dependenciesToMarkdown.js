import { join } from 'path';
import { readFileSync } from 'fs';
import expect from 'expect';

import { lf } from 'eol';

import dependenciesToMarkdown from '../../src/commands/markdown/dependenciesToMarkdown';
import getContext from '../fixtures/getContext';

describe('documentation', () => {
    describe('markdown', () => {
        describe('dependenciesToMarkdown', () => {
            it('should correctly format dependencies when no dependencies', () => {
                expect(dependenciesToMarkdown('name'))
                    .toBe('# Dependencies for `name`\n\n__No dependencies available.__\n');
            });

            it('should correctly format dependencies for project empty', () => {
                const project = join(__dirname, '..', 'fixtures', 'projects', 'empty');
                const context = getContext(project);

                expect(dependenciesToMarkdown('empty', true, context.dependencies))
                    .toEqual(lf(readFileSync(join(project, 'docs', 'Dependencies.md'), 'utf8')));
            });

            it('should correctly format dependencies for project complex', () => {
                const project = join(__dirname, '..', 'fixtures', 'projects', 'complex');
                const context = getContext(project);

                expect(dependenciesToMarkdown('complex', true, context.dependencies))
                    .toEqual(lf(readFileSync(join(project, 'docs', 'Dependencies.md'), 'utf8')));
            });
        });
    });
});
