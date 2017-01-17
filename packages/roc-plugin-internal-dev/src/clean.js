const rimraf = require.resolve('rimraf/bin');

const clean = (extension) => `${rimraf} ${extension.path}/lib ${extension.path}/esdocs`;

module.exports = (extensions) =>
    extensions
        .map(clean)
        .join(' & ');
