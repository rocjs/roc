const rimraf = require.resolve('rimraf/bin');

const remove = (extension) => `${rimraf} ${extension.path}/node_modules`;

module.exports = (extensions) =>
    extensions
        .map(remove)
        .join(' & ');
