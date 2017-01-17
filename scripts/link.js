const spawnCommand = require('spawn-command');

const link = require('../packages/roc-plugin-internal-dev/lib/link');

const all = require('./get').all;
const execute = require('./execute');

link(execute, all)({
    arguments: {
        managed: {},
    },
    options: {
        managed: {},
    }
})
