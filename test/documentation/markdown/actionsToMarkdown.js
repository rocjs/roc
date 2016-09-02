import { join } from 'path';
import { readFileSync } from 'fs';

import expect from 'expect';
import { lf } from 'eol';

import actionsToMarkdown from '../../../src/documentation/markdown/actionsToMarkdown';
import getContext from '../fixtures/getContext';

describe('documentation', () => {
    describe('markdown', () => {
        describe('actionsToMarkdown', () => {
            it('should correctly format actions when no actions', () => {
                expect(actionsToMarkdown('name'))
                    .toBe('# Actions for `name`\n\n__No actions available.__\n');
            });

            it('should correctly format actions for project empty', () => {
                const project = join(__dirname, '..', 'fixtures', 'projects', 'empty');
                const context = getContext(project);

                expect(actionsToMarkdown('empty', context.actions))
                    .toBe(lf(readFileSync(join(project, 'docs', 'Actions.md'), 'utf8')));
            });

            it('should correctly format actions for project complex', () => {
                const project = join(__dirname, '..', 'fixtures', 'projects', 'complex');
                const context = getContext(project);

                expect(actionsToMarkdown('complex', context.actions))
                    .toBe(lf(readFileSync(join(project, 'docs', 'Actions.md'), 'utf8')));
            });
        });
    });
});
