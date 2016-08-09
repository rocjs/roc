import { join } from 'path';

import expect from 'expect';

import folderExists from '../../src/helpers/folderExists';

describe('roc', () => {
    describe('helpers', () => {
        describe('folderExists', () => {
            it('should return true if file exists', () => {
                expect(folderExists(__dirname))
                    .toBe(true);
            });

            it('should return false if file do not exist', () => {
                expect(folderExists(join(__dirname, 'nope')))
                    .toBe(false);
            });
        });
    });
});
