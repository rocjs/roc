import { join } from 'path';
import { readFileSync } from 'fs';
import expect from 'expect';

import { lf } from 'eol';

import configurationToMarkdown from '../../src/commands/markdown/configurationToMarkdown';
import getContext from '../fixtures/getContext';

describe('documentation', () => {
    describe('markdown', () => {
        describe('configurationToMarkdown', () => {
            it('should correctly format config when no config', () => {
                expect(configurationToMarkdown('name'))
                    // eslint-disable-next-line
                    .toBe('# Config for `name`\n\nConfiguration that can be defined in `roc.config.js`, other than settings and project.\n\n__No config available.__\n');
            });

            it('should correctly format config for project empty', () => {
                const project = join(__dirname, '..', 'fixtures', 'projects', 'empty');
                const context = getContext(project);

                expect(configurationToMarkdown('empty', context.extensionConfig, context.meta))
                    .toBe(lf(readFileSync(join(project, 'docs', 'Configuration.md'), 'utf8')));
            });

            it('should correctly format config for project complex', () => {
                const project = join(__dirname, '..', 'fixtures', 'projects', 'complex');
                const context = getContext(project);

                expect(configurationToMarkdown('complex', context.extensionConfig, context.meta))
                    .toBe(lf(readFileSync(join(project, 'docs', 'Configuration.md'), 'utf8')));
            });
        });
    });
});
