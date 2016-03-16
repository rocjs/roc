#! /usr/bin/env node

require('source-map-support').install();
require('loud-rejection')();

const pkg = require('../package.json');
const runCli = require('../lib/cli').runCli;
const roc = require('../lib').roc;

runCli({
    version: pkg.version,
    name: pkg.name
}, roc.config, roc.meta);
