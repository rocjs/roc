module.exports = {
    source: './src',
    destination: './esdocs',
    excludes: [],
    plugins: [{
        name: require.resolve('esdoc-es7-plugin'),
    }, {
        name: require.resolve('esdoc-importpath-plugin'),
        option: {
            replaces: [
                { from: '^src/', to: 'lib/' },
            ],
        },
    }],
};
