module.exports = {
    prompts: {
        hello: {
            type: 'input',
            required: true,
        },
        welcome: {
            type: 'input',
            default: (answers) => {
                if (answers.hello === 'something') {
                    return 'this should be a default';
                }
                return 'nope';
            },
            required: true,
        },
    },
};
