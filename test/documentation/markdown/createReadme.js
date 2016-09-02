import { join } from 'path';
import { readFileSync } from 'fs';

import expect from 'expect';
import { lf } from 'eol';

import createReadme from '../../../src/documentation/markdown/createReadme';
import defaultCommands from '../../../src/commands';
import getContext from '../fixtures/getContext';

describe('documentation', () => {
    describe('markdown', () => {
        describe('createReadme', () => {
            it('should correctly format ROC.md for project empty', () => {
                const project = join(__dirname, '..', 'fixtures', 'projects', 'empty');
                const context = getContext(project, defaultCommands);

                expect(createReadme('empty', 'docs', false, { context }))
                    .toEqual(lf(readFileSync(join(project, 'ROC.md'), 'utf8')));
            });

            it('should correctly format ROC.md for project complex', () => {
                const project = join(__dirname, '..', 'fixtures', 'projects', 'complex');
                const context = getContext(project, defaultCommands);

                expect(createReadme('complex', 'docs', false, { context }))
                    .toEqual(lf(readFileSync(join(project, 'ROC.md'), 'utf8')));
            });
        });
    });
});
