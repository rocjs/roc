import expect from 'expect';

import fileExists from '../../src/helpers/fileExists';

describe('helpers', () => {
    describe('fileExists', () => {
        it('should return true if file exists', () => {
            expect(fileExists('fileExists.js', __dirname))
                .toBe(true);
        });

        it('should return false if file do not exist', () => {
            expect(fileExists('roc.config.js', __dirname))
                .toBe(false);
        });
    });
});
