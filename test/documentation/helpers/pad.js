import expect from 'expect';

import pad from '../../../src/documentation/helpers/pad';

describe('roc', () => {
    describe('documentation helpers', () => {
        describe('pad', () => {
            it('should pad correctly', () => {
                expect(pad(4, '-')).toBe('----');
            });
        });
    });
});
