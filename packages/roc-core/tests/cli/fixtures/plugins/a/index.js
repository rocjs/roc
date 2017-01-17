let commandSpy;

module.exports = {
    setSpy: (spy) => { commandSpy = spy; },
    roc: {
        name: 'roc-plugin-a',
        version: '1.0.0',
        standalone: true,
        commands: {
            test: {
                command: (...args) => commandSpy(...args),
                arguments: [{
                    name: 'artifact',
                }],
                options: [{
                    name: 'list',
                }],
                settings: true,
            },
        },
    },
};
