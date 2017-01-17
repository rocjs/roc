const spawnCommand = require('spawn-command'); // eslint-disable-line

const build = require('../packages/roc-plugin-internal-dev/src/build');

const all = require('./get').all;

spawnCommand(build(all), {
    stdio: 'inherit',
});
