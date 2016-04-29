#! /usr/bin/env node
require('source-map-support').install();
require('loud-rejection')();
const debug = require('debug')('roc:core:bin');

debug('Binary started with source-map support and loud-rejection.');

const path = require('path');
const updateNotifier = require('update-notifier');
const pkg = require('../package.json');

const fileExists = require('../lib/helpers').fileExists;

debug('Detecting CLI context.');
const currentCli = require.resolve('./cli');
const localCli = path.resolve(process.cwd(), 'node_modules/roc/bin/cli');

if (currentCli !== localCli) {
    // Are we global?
    if (!fileExists(path.resolve(process.cwd(), 'node_modules/.bin/roc'))) {
        updateNotifier({ pkg }).notify({ defer: false });
        debug('Using global CLI.');
        require(currentCli);
    } else {
        // Will try to use the local CLI over the global one
        try {
            debug('Using local CLI.');
            const cli = require.resolve(localCli);
            console.log('Found a local version of Roc, will use that over the global one.', '\n');
            return require(cli);
        } catch (err) {
            console.log('An error happened when trying to load local CLI, will use the global one.', '\n');
        }
    }
}

debug('Using local CLI.');
require(currentCli);
