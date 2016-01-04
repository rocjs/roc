#! /usr/bin/env node

import 'source-map-support/register';

import { runCli } from '../cli';
import { isPath, isString } from '../validation/validators';

import init from './commands/init';

const pkg = require('../../package.json');

runCli({
    version: pkg.version,
    name: pkg.name
}, {
    commands: {
        init
    }
}, {
    commands: {
        init: {
            description: 'Init a new project.',
            flags: [{
                name: 'force',
                short: 'f',
                description: 'Ignore if the folder is not empty.'
            }],
            options: [{
                name: 'template',
                validation: isPath
            }, {
                name: 'version',
                validation: isString
            }]
        }
    }
});
