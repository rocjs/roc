/* eslint-disable import/no-dynamic-require */

const fs = require('fs');

const extensions =
    !fs.existsSync(`${process.cwd()}/packages`) ? [] :
    fs.readdirSync(`${process.cwd()}/packages`)
        .map((extension) => {
            if (fs.existsSync(`${process.cwd()}/packages/${extension}/package.json`)) {
                return {
                    folder: extension,
                    path: `${process.cwd()}/packages/${extension}`,
                    name: require(`${process.cwd()}/packages/${extension}/package.json`).name,
                    roc: !!require(`${process.cwd()}/packages/${extension}/package.json`).roc,
                    packageJSON: require(`${process.cwd()}/packages/${extension}/package.json`),
                };
            }
            return undefined;
        })
        .filter((extension) => extension !== undefined);

module.exports = {
    all: extensions,
    extensions: extensions.filter(({ roc }) => roc),
};
