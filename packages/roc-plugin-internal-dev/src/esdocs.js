const esdoc = require.resolve('esdoc/out/src/ESDocCLI.js');

const esdocConfig = require.resolve('../configuration/esdoc.js');

const esdocs = (extension) => `cd ${extension.path} && ${esdoc} -c ${esdocConfig}`;

module.exports = (extensions) =>
    extensions
        .map(esdocs)
        .join(' & ');
