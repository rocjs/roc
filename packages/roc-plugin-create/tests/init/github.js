import expect from 'expect';

import { getVersions } from '../../src/commands/init/githubHelpers';

describe('commands', () => {
    describe('init', () => {
        describe('githubHelpers', () => {
            describe('getVersions', () => {
                it('should return a promise', () => {
                    const result = getVersions('roc');
                    expect(result).toBeA(Promise);
                });

                it('should throw if no package is given', () => {
                    expect(() => getVersions())
                        .toThrow();
                });
            });
        });
    });
});
