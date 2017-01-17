#! /usr/bin/env node

const path = require('path');
const fs = require('fs');

const log = require('roc-logger/default/small');
const directory = require('roc-cli').getDirectory();

const currentRoc = require.resolve('./roc');
const localRoc = path.resolve(directory, 'node_modules/roc/bin/roc.js');

if (currentRoc !== localRoc && fs.existsSync(localRoc)) {
    log.info('Found a local version of roc that will be used instead of the global one.');
    require(localRoc)(directory, true);
} else {
    require(currentRoc)(directory);
}
