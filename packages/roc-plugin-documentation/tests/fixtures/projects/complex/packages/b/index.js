module.exports = {
    roc: {
        actions: [
            () => () => () => { },
            {
                extension: 'roc-package-core-dev',
                hook: 'before-clean',
                action: () => () => () => { },
                post: () => () => () => { },
                description: 'Some __description__.',
            },
        ],
        config: {
            settings: {
                group: {
                    value2: true,
                },
            },
        },
    },
};
