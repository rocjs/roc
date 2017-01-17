/* eslint-disable import/no-dynamic-require */

/*
  This file needs to be compatible with the version of Node used
  to build Roc in the case of roc-plugin-internal-dev not working
  without needing external dependencies
*/

const fs = require('fs');
const path = require('path');

const linkExtra = (extra, yarn) => {
    if (extra.length === 0) {
        // Noop in bash
        return ':';
    }

    const pkg = yarn ? 'yarn' : 'npm';

    return extra
      .map((dependency) => `${pkg} link ${dependency}`)
      .join(' && ');
};

const removeDependencies = (dependencies = {}, localDependencies) => {
    const newDependencies = {};

    Object.keys(dependencies)
        .filter((dependency) => localDependencies.indexOf(dependency) === -1)
        .forEach((dependency) => { newDependencies[dependency] = dependencies[dependency]; });

    return newDependencies;
};

const install = (execute, extension, extra, yarn, localDependencies) => {
    const pathToPackageJSON = path.join(extension.path, 'package.json');
    const packageJSON = require(pathToPackageJSON);
    const newPackageJSON = Object.assign({}, packageJSON);

    newPackageJSON.dependencies = removeDependencies(packageJSON.dependencies, localDependencies);
    newPackageJSON.devDependencies = removeDependencies(packageJSON.devDependencies, localDependencies);

    fs.writeFileSync(pathToPackageJSON, JSON.stringify(newPackageJSON, null, 2) + '\n');
    const pkg = yarn ? 'yarn' : 'npm';
    console.log(`Installing dependencies and linking ${extension.name}…`);

    const restorePackageJSON = () => fs.writeFileSync(pathToPackageJSON, JSON.stringify(packageJSON, null, 2) + '\n');

    return execute(`cd ${extension.path} && ${linkExtra(extra, yarn)} && ${pkg} install && ${pkg} link`)
        .then(restorePackageJSON, restorePackageJSON);
};

const link = (execute, extension, yarn, localDependencies) => {
    const pkg = yarn ? 'yarn' : 'npm';
    const pathToPackageJSON = path.join(extension.path, 'package.json');

    const packageJSON = require(pathToPackageJSON);
    const toLink = Object.keys(Object.assign({}, packageJSON.dependencies, packageJSON.devDependencies))
        .filter((dependency) => localDependencies.indexOf(dependency) !== -1)
        .map((prev) => `${pkg} link ${prev}`);

    console.log(`Linking dependencies for ${extension.name}…`);

    if (toLink.length === 0) {
        return Promise.resolve();
    }

    return execute(`cd ${extension.path} && ${toLink.join(' && ')}`);
};

module.exports = (execute, extensions) => (commandObject) => {
    const localDependencies = extensions.map(({ name }) => name);
    const extra = commandObject.arguments.managed.modules || [];
    const yarn = commandObject.options.managed.yarn;
    return extensions
        .reduce(
            (prev, extension) => prev.then(() => install(execute, extension, extra, yarn, localDependencies)),
            Promise.resolve(),
        )
        .then(
            () =>
                extensions.reduce(
                    (prev, extension) => prev.then(() => link(execute, extension, yarn, localDependencies)),
                    Promise.resolve(),
                ),
        );
};
