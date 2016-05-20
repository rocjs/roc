import {
    generateTextDocumentation,
    generateMarkdownDocumentation,
    generateMarkdownHooks,
    generateMarkdownActions,
    generateMarkdownDependencies
} from '../';

import validRocProject from '../helpers/valid-roc-project';

/**
 * List the settings that are possible with the current packages.
 */
function listSettings({ metaObject, packageConfig }) {
    /* eslint-disable no-console */
    console.log(generateTextDocumentation(packageConfig, metaObject));
    /* eslint-enable */
}

/**
 * List the settings that are possible with the current packages in a markdown format.
 *
 * Tip: Can be used to create Markdown files.
 * `roc markdown-settings > settings.md`
 */
function markdownSettings({ info: { name }, metaObject, packageConfig }) {
    /* eslint-disable no-console */
    console.log(generateMarkdownDocumentation(name, packageConfig, metaObject));
    /* eslint-enable */
}

/**
 * List the settings that are possible with the current packages.
 *
 * Tip: Can be used to create Markdown files.
 * `roc markdown-hooks > hooks.md`
 */
function markdownHooks({ info: { name }, hooks }) {
    /* eslint-disable no-console */
    console.log(generateMarkdownHooks(name, hooks));
    /* eslint-enable */
}

/**
 * List the settings that are possible with the current packages in a markdown format.
 *
 * Tip: Can be used to create Markdown files.
 * `roc markdown-actions > actions.md`
 */
function markdownActions({ info: { name }, actions }) {
    /* eslint-disable no-console */
    console.log(generateMarkdownActions(name, actions));
    /* eslint-enable */
}

function markdownDependencies({ info: { name }, dependencies }) {
    /* eslint-disable no-console */
    console.log(generateMarkdownDependencies(name, dependencies));
    /* eslint-enable */
}

export const getDefaultConfig = (directory) => {
    let config = {
        settings: {},

        commands: {},

        plugins: [],

        packages: [],

        action: undefined
    };

    if (validRocProject(directory)) {
        config = {
            ...config,
            commands: {
                meta: {
                    'list-settings': listSettings,
                    'markdown-settings': markdownSettings,
                    'markdown-hooks': markdownHooks,
                    'markdown-actions': markdownActions,
                    'markdown-dependencies': markdownDependencies
                }
            }
        };
    }

    return config;
};

export const getDefaultMeta = (directory) => {
    let meta = {};

    if (validRocProject(directory)) {
        meta = {
            ...meta,
            commands: {
                meta: {
                    'list-settings': {
                        description: 'Prints all the available settings that can be changed.'
                    },
                    'markdown-settings': {
                        description: 'Prints all the available settings that can be changed in a markdown format.'
                    },
                    'markdown-hooks': {
                        description: 'Prints all the registered hooks in a markdown format.'
                    },
                    'markdown-actions': {
                        description: 'Prints all the registered actions in a markdown format.'
                    }
                }
            }
        };
    }

    return meta;
};
