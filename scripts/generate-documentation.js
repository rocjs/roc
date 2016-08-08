const fs = require('fs');
const path = require('path');

const commandsToMarkdown = require('../lib/documentation/markdown/commandsToMarkdown').default;
const hooksToMarkdown = require('../lib/documentation/markdown/hooksToMarkdown').default;
const getDefaults = require('../lib/context/helpers/getDefaults').default;
const commands = require('../lib/commands').default;

const context = getDefaults({
    commands,
});

// Write documentation for commands
fs.writeFile(
    path.resolve('./docs/default/Commands.md'),
    commandsToMarkdown(
       'roc',
       context.config,
       context.commands
   )
);

// Write documentation for hooks
fs.writeFile(
    path.resolve('./docs/default/Hooks.md'),
    hooksToMarkdown(
       'roc',
       context.hooks
   )
);
