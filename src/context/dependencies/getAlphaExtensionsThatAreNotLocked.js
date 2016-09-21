export const officialExtensions = {
    'roc-package-base': '1.0.0-alpha.10',
    'roc-package-base-dev': '1.0.0-alpha.10',

    'roc-package-module': '1.0.0-alpha.6',
    'roc-package-module-dev': '1.0.0-alpha.6',

    'roc-package-webpack': '1.0.0-alpha.11',
    'roc-package-webpack-dev': '1.0.0-alpha.11',

    'roc-package-webpack-web': '1.0.0-alpha.7',
    'roc-package-webpack-web-dev': '1.0.0-alpha.7',

    'roc-package-webpack-node': '1.0.0-alpha.5',
    'roc-package-webpack-node-dev': '1.0.0-alpha.5',

    'roc-package-web-app': '1.0.0-alpha.8',
    'roc-package-web-app-dev': '1.0.0-alpha.8',

    'roc-package-web-app-react': '1.0.0-alpha.11',
    'roc-package-web-app-react-dev': '1.0.0-alpha.11',

    'roc-package-web-component': '1.0.0-alpha.4',
    'roc-package-web-component-dev': '1.0.0-alpha.4',

    'roc-plugin-react': '1.0.0-alpha.3',
    'roc-plugin-react-dev': '1.0.0-alpha.3',

    'roc-plugin-assets-images': '1.0.0-alpha.2',

    'roc-plugin-browsersync': '1.0.0-alpha.3',

    'roc-plugin-start': '1.0.0-alpha.2',

    'roc-plugin-style-css': '1.0.0-alpha.6',

    'roc-plugin-style-sass': '1.0.0-alpha.3',

    'roc-plugin-style-less': '1.0.0-alpha.2',

    'roc-abstract-plugin-test': '1.0.0-alpha.2',

    'roc-plugin-test-mocha-karma-webpack': '1.0.0-alpha.7',

    'roc-plugin-test-mocha-webpack': '1.0.0-alpha.2',
};

export default function getAlphaExtensionsThatAreNotLocked(packageJSON = {}) {
    const notLocked = {
        dependencies: [],
        devDependencies: [],
    };

    if (packageJSON.dependencies) {
        Object.keys(packageJSON.dependencies).forEach((dependency) => {
            if (
                /alpha/.test(packageJSON.dependencies[dependency]) &&
                officialExtensions[dependency] !== packageJSON.dependencies[dependency]
            ) {
                notLocked.dependencies.push(dependency);
            }
        });
    }

    if (packageJSON.devDependencies) {
        Object.keys(packageJSON.devDependencies).forEach((dependency) => {
            if (
                /alpha/.test(packageJSON.devDependencies[dependency]) &&
                officialExtensions[dependency] !== packageJSON.devDependencies[dependency]
            ) {
                notLocked.devDependencies.push(dependency);
            }
        });
    }

    if (!notLocked.dependencies.length && !notLocked.devDependencies.length) {
        return undefined;
    }

    return notLocked;
}
