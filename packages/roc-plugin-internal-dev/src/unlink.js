const unlink = (execute, extension, yarn) => {
    const pkg = yarn ? 'yarn' : 'npm';
    console.log(`Unlinking ${extension.name}…`);
    return execute(`${pkg} unlink ${extension.name}`);
};

module.exports = (execute, extensions) => (commandObject) => {
    const yarn = commandObject.options.managed.yarn;
    return extensions
        .reduce((prev, extension) => prev.then(() => unlink(execute, extension, yarn)), Promise.resolve());
};
