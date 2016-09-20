import expect from 'expect';

import getRocPackageDependencies from '../../src/helpers/getRocPackageDependencies';

describe('helpers', () => {
    describe('getRocPackageDependencies', () => {
        it('should correctly fetch all the Roc dependencies', () => {
            const packageJson = {
                dependencies: {
                    roc: '^1.0.0',
                    koa: '^2.0.0',
                    colors: '*',
                    'roc-package-web': '^1.1.0',
                    'roc-plugin-web': '^1.1.0',
                    '@name/roc-package-web-react': '~1.2.0',
                },
                devDependencies: {
                    mocha: '2.3.4',
                    'roc-package-test': '2.0.1',
                },
            };
            expect(getRocPackageDependencies(packageJson))
                .toEqual(['@name/roc-package-web-react', 'roc-package-web', 'roc-package-test']);
        });
    });
});
