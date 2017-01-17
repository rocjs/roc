const chalk = require('chalk');
const buildContext = require('roc-core/lib/context/buildContext').default;
const generateDocumentation = require('roc-plugin-documentation/lib/commands/markdown/generateDocumentation').default;
const log = require('roc-logger/default/small');

module.exports = (extensions) => () =>
    extensions
        .filter(({ roc }) => roc)
        .reduce((promise, extension) =>
            promise.then(() => {
                log.log(`Generating documentation for ${chalk.cyan(extension.name)}`);
                return generateDocumentation({
                    commandObject: {
                        context: buildContext(extension.path, undefined, false),
                    },
                    extension: true,
                    name: 'roc',
                });
            }), Promise.resolve())
        .then(() => {
            log.log();
            log.success('Documentation created for all extensions!');
        })
        .catch((err) => {
            log.error('An error happened when generating documentation', err);
        });
