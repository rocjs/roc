import isObject from 'roc-validators/lib/isObject';
import isFunction from 'roc-validators/lib/isFunction';

const { name, version } = require('../../package.json');

// eslint-disable-next-line
export const roc = {
    name,
    version,
    hooks: {
        'update-settings': {
            description: `
            Expected to return new settings that should be merged with the existing ones.

            Makes it possible to modify the settings object before a command is started and after potential arguments from the command line and configuration file have been parsed. This is a good point to default to some value if no was given or modify something in the settings.`, // eslint-disable-line
            arguments: {
                getSettings: {
                    validator: isFunction,
                    description: 'A function that returns the settings after the context has been initialized.',
                },
            },
            returns: isObject(),
            hasCallback: true,
        },
    },
};
