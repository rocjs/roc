const lint = (extension) => `cd ${extension.path}/ && npm run lint`;

module.exports = (extensions) =>
    extensions
        .map(lint)
        .join(' && ');
