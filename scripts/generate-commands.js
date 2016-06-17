const fs = require('fs');
const path = require('path');

const merge = require('../lib').merge;
const generateMarkdownCommands = require('../lib/commands/markdown-commands').default;
const getDefaultCommands = require('../lib/cli/get-default').getDefaultCommands;
const commands = require('../lib/roc/commands').default;

fs.writeFile(
    path.resolve('./docs/DefaultCommands.md'),
    generateMarkdownCommands(
       'roc',
       { settings: {} },
       merge(commands, getDefaultCommands('', true))
   )
);
