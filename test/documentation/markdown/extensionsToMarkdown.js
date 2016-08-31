import { join } from 'path';
import { readFileSync } from 'fs';

import expect from 'expect';

import extensionsToMarkdown from '../../../src/documentation/markdown/extensionsToMarkdown';

import getContext from './fixtures/getContext';

describe('documentation', () => {
    describe('markdown', () => {
        describe('extensionsToMarkdown', () => {
            it('should correctly format extensions when no extensions', () => {
                expect(extensionsToMarkdown('name'))
                    // eslint-disable-next-line
                    .toBe('# Extensions for `name`\n\nThe extensions that are used in the project, indirect and direct, in the order that they were added.\n\n## Packages\n_No packages._\n\n## Plugins\n_No plugins._\n');
            });

            it('should correctly format extensions for project empty', () => {
                const project = join(__dirname, 'fixtures', 'projects', 'empty');
                const context = getContext(project);

                expect(extensionsToMarkdown('empty', context.usedExtensions, { context }))
                    .toBe(readFileSync(join(project, 'docs', 'Extensions.md'), 'utf8'));
            });

            it('should correctly format extensions for project complex', () => {
                const project = join(__dirname, 'fixtures', 'projects', 'complex');
                const context = getContext(project);

                expect(extensionsToMarkdown('complex', context.usedExtensions, { context }))
                    .toBe(readFileSync(join(project, 'docs', 'Extensions.md'), 'utf8'));
            });
        });
    });
});
