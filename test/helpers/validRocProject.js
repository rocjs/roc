import { join } from 'path';

import expect from 'expect';

import validRocProject from '../../src/helpers/validRocProject';

describe('helpers', () => {
    describe('validRocProject', () => {
        it('should validate a project with a roc field in package.json with at least one package', () => {
            expect(validRocProject(join(__dirname, 'fixtures', 'validRocProject', '1')))
                .toBe(true);
        });

        it('should validate a project that has at least one package in the dependencies', () => {
            expect(validRocProject(join(__dirname, 'fixtures', 'validRocProject', '2')))
                .toBe(true);
        });
    });
});
