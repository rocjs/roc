import path from 'path';
import expect from 'expect';

import getPackageJSON from '../src/getPackageJSON';

describe('helpers', () => {
    describe('getPackageJSON', () => {
        it('should correctly read package.json', () => {
            expect(getPackageJSON(path.join(__dirname, '../')).name)
                .toBe('roc-utils');
        });

        it('should correctly manage when no package.json exists', () => {
            expect(getPackageJSON(__dirname))
                .toBe(undefined);
        });
    });
});
