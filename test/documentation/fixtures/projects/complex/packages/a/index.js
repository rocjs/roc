const path = require('path');

module.exports = {
    roc: {
        packages: [require.resolve(path.join(__dirname, '..', 'b', 'index.js'))],
        dependencies: {
            uses: {
                lodash: '~4.0.0',
            },
            exports: {
                react: '^15.0.0',
            },
            requires: {
                noop3: '*',
            },
        },
    },
};
