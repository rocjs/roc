import expect from 'expect';

import getRocPluginDependencies from '../../src/helpers/getRocPluginDependencies';

describe('helpers', () => {
    describe('getRocPluginDependencies', () => {
        it('should correctly fetch all the Roc dependencies', () => {
            const packageJson = {
                dependencies: {
                    roc: '^1.0.0',
                    koa: '^2.0.0',
                    colors: '*',
                    'roc-package-web': '^1.1.0',
                    'roc-plugin-web': '^1.1.0',
                    '@name/roc-plugin-web-react': '~1.2.0',
                },
                devDependencies: {
                    mocha: '2.3.4',
                    'roc-plugin-test': '2.0.1',
                },
            };
            expect(getRocPluginDependencies(packageJson))
                .toEqual(['roc-plugin-web', '@name/roc-plugin-web-react', 'roc-plugin-test']);
        });
    });
});
