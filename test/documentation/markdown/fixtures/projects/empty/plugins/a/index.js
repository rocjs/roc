const path = require('path');

module.exports = {
    roc: {
        plugins: [require.resolve(path.join(__dirname, '..', 'b', 'index.js'))],
    },
};
