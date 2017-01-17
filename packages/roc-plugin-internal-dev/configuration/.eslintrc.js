module.exports = {
    extends: require.resolve('eslint-config-airbnb-base'),

    parser: require.resolve('babel-eslint'),

    plugins: ['eslint-plugin-babel'],

    rules: {
        indent: [2, 4, { SwitchCase: 1 }],
        'max-len': [2, 120, 4],
        'no-warning-comments': 1,

        'generator-star-spacing': 0,
        'babel/generator-star-spacing': 1,

        'import/order': [2, {
            groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
            'newlines-between': 'always',
        }],
        'import/newline-after-import': [2],

        // We only want warnings for this since Roc extensions might get dependencies from the runtime.
        'import/no-extraneous-dependencies': [1],
        'import/no-unresolved': [1],
    },
};
