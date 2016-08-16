import { sep } from 'path';

import expect from 'expect';

import getAbsolutePath from '../../src/helpers/getAbsolutePath';

describe('helpers', () => {
    describe('getAbsolutePath', () => {
        it('should correctly append directory if not absolute', () => {
            expect(getAbsolutePath('roc.config.js', '/some/dir'))
                .toBe(`${sep}some${sep}dir${sep}roc.config.js`);
        });

        it('should not touch an already absolute path', () => {
            expect(getAbsolutePath('/roc.config.js'))
                .toBe('/roc.config.js');
        });

        it('should return undefined if no path is given', () => {
            expect(getAbsolutePath())
                .toBe(undefined);
        });
    });
});
