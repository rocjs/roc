const link = require('../packages/roc-plugin-internal-dev/src/unlink');

const all = require('./get').all;
const execute = require('./execute');

link(execute, all)({
    arguments: {
        managed: {},
    },
    options: {
        managed: {},
    },
});
