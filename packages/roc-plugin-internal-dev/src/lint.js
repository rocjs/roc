const eslint = require.resolve('eslint/bin/eslint');
const eslintConfig = require.resolve('../configuration/.eslintrc.js');

const eslintCommand = (extension) =>
    `${eslint} --config ${eslintConfig} ${extension.path}/src --no-ignore`;

module.exports = (extensions) =>
    extensions
        .map(eslintCommand)
        .join(' && ');
