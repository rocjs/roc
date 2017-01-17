const path = require('path');

module.exports = {
    roc: {
        packages: [require.resolve(path.join(__dirname, '..', 'b', 'index.js'))],
    },
};
