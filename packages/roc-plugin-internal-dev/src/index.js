/* eslint-disable import/no-dynamic-require */

const fs = require('fs');

const converters = require('roc-converters');
const validators = require('roc-validators');
const execute = require('roc-execute/lib/execute').default;
const log = require('roc-logger/default/small');

const getProjects = (baseDirectory, directory) => {
    if (!fs.existsSync(`${baseDirectory}/${directory}`)) {
        return [];
    }

    return fs.readdirSync(`${baseDirectory}/${directory}`)
        .map((project) => {
            if (fs.existsSync(`${baseDirectory}/${directory}/${project}/package.json`)) {
                return {
                    folder: project,
                    path: `${baseDirectory}/${directory}/${project}`,
                    name: require(`${baseDirectory}/${directory}/${project}/package.json`).name,
                    roc: !!require(`${baseDirectory}/${directory}/${project}/package.json`).roc,
                    packageJSON: require(`${baseDirectory}/${directory}/${project}/package.json`),
                };
            }
            return undefined;
        })
        .filter((extension) => extension !== undefined);
};

module.exports.roc = {
    init: ({ context: { directory } }) => {
        // Look for things in either of these directories
        const projects = [
            'extensions',
            'packages',
            'plugins',
        ].reduce((previous, dir) => previous.concat(getProjects(directory, dir)), []);

        return {
            roc: {
                commands: {
                    rid: {
                        build: {
                            command: require('./build')(projects),
                            description: 'Builds project',
                        },
                        'build:watch': {
                            command: require('./buildWatch')(projects),
                            description: 'Builds project in watch mode',
                        },
                        clean: {
                            command: require('./clean')(projects),
                            description: 'Cleans generated files',
                        },
                        docs: {
                            command: require('./docs')(projects),
                            description: 'Generates markdown documentation',
                        },
                        esdocs: {
                            command: require('./esdocs')(projects),
                            description: 'Generates ESDoc',
                        },
                        link: {
                            command: require('./link')(execute, projects),
                            description: 'Links up the project',
                            arguments: {
                                modules: {
                                    description: 'Modules that should be linked into the extensions in extensions/',
                                    converter: converters.toArray(),
                                    validator: validators.isArray(),
                                },
                            },
                            options: {
                                yarn: {
                                    description: 'If yarn should be used over npm',
                                    default: false,
                                    validator: validators.isBoolean,
                                },
                            },
                        },
                        'lint:alias': {
                            command: require('./lintAlias')(projects),
                            description: 'Run local lint inside packages',
                        },
                        lint: {
                            command: require('./lint')(projects),
                            description: 'Runs lint',
                        },
                        release: {
                            command: require('./release')(projects),
                            description: 'Run release script',
                            options: {
                                'use-alias': {
                                    description: 'If lint:alias should be used over the default lint when releasing',
                                    default: false,
                                    converter: converters.toBoolean,
                                    validator: validators.isBoolean,
                                },
                                next: {
                                    description: 'Publish to next tag on npm',
                                    default: false,
                                    converter: converters.toBoolean,
                                    validator: validators.isBoolean,
                                },
                            },
                        },
                        rnm: {
                            command: require('./removeNodeModules')(projects),
                            description: 'Removes node_modules folders in extensions/',
                        },
                        list: {
                            description: 'List the projects that will be used when running the commands',
                            command: () => {
                                if (projects.length === 0) {
                                    return log.log('Nothing found.');
                                }

                                return log.log('Found the following:\n' +
                                    projects.map((project) => `  ${project.name}`).join('\n'),
                                );
                            },
                        },
                    },
                },
            },
        };
    },
};
