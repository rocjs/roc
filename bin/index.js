#! /usr/bin/env node
require('source-map-support').install();
require('loud-rejection')();

const path = require('path');
const updateNotifier = require('update-notifier');
const pkg = require('../package.json');

const fileExists = require('../lib/helpers').fileExists;

const currentCli = require.resolve('./cli');
const localCli = path.resolve(process.cwd(), 'node_modules/roc/bin/cli');

if (currentCli !== localCli) {
    // Are we global?
    if (!fileExists(path.resolve(process.cwd(), 'node_modules/.bin/roc'))) {
        updateNotifier({ pkg }).notify({ defer: false });
        return require(currentCli);
    }

    // Will try to use the local CLI over the global one
    try {
        const cli = require.resolve(localCli);
        console.log('Found a local version of Roc, will use that over the global one.', '\n');
        return require(cli);
    } catch (err) {
        console.log('An error happened when trying to load local CLI, will use the global one.', '\n');
    }
}

require(currentCli);
