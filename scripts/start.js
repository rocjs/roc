require('../packages/roc-core/lib').runCLI({
    info: {
        name: 'npm start',
        version: '1.0.0',
    },
    plugins: [
        require.resolve('../packages/roc-plugin-internal-dev'),
    ],
});
