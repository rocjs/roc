#! /usr/bin/env node

const path = require('path');

const updateNotifier = require('update-notifier');

const packageJSON = require('../package.json');
const fileExists = require('../lib/helpers').fileExists;
const getAbsolutePath = require('../lib/helpers').getAbsolutePath;
const processArguments = require('../lib/cli/processArguments').default;

const args = processArguments();
const directory = getAbsolutePath(args.coreOptions.directory || args.coreOptions.d || process.cwd());

const currentCli = require.resolve('./cli');
const localCli = path.resolve(directory, 'node_modules/roc/bin/cli');

if (currentCli !== localCli) {
    // Are we global?
    if (!fileExists(path.resolve(directory, 'node_modules/.bin/roc'))) {
        updateNotifier({ pkg: packageJSON }).notify({ defer: false });
        require(currentCli); // eslint-disable-line
    } else {
        const cli = require.resolve(localCli);
        console.log('Found a local version of Roc, will use that over the global one.', '\n');
        require(cli); // eslint-disable-line
    }
} else {
    require(currentCli); // eslint-disable-line
}
