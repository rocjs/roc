import { join, dirname } from 'path';
import chalk from 'chalk';
import { _findPath } from 'module';
import resolve from 'resolve';
import { isString } from 'lodash';
import semver from 'semver';

import { registerHooks, getHooks, setHooks } from '../../hooks';
import { registerActions, getActions, setActions } from '../../hooks/actions';
import { merge } from '../../configuration';
import { warningLabel, feedbackMessage } from '../../helpers/style';
import ExtensionError from './error';
import { setDependencies, getDependencies, setDevExports, getDevExports } from './dependencies';
import { fileExists } from '../../helpers';
import manageCommands from './commands';

export function manageDevExports(initialState) {
    initialState.usedExtensions.forEach((name) =>
        getDevExports(name) && setDependencies(name, { exports: getDevExports(name) }));
    return initialState;
}

export function runPostInits(initialState) {
    return initialState.postInits.reduceRight(
        (state, { postInit, name }) =>
            manageRocObject(
                postInit({
                    config: state.config,
                    meta: state.meta,
                    extensions: state.usedExtensions,
                    actions: state.actions,
                    hooks: state.hooks,
                    currentDependencies: state.dependencies,
                    currentCommands: state.commands,
                    localDependencies: getDependencies(name)
                }), state, true
            ),
        initialState
    );
}

export function getExtensions(type) {
    return (extensions, directory) => (initialState) => {
        return extensions.reduce(
            (state, extensionPath) => {
                // Get the extension
                const roc = getExtension(extensionPath, directory, type);

                if (roc) {
                    try {
                        const nextState = getCompleteExtensionTree(
                            roc,
                            extensionPath,
                            state
                        );

                        nextState.projectExtensions.push({
                            name: roc.name,
                            version: roc.version
                        });

                        return nextState;
                    } catch (err) {
                        console.log(feedbackMessage(
                            warningLabel('Warning', 'Roc Extension Failed'),
                            `Failed to load Roc ${type} ${chalk.bold(extensionPath)}\n\n` +
                            (state.verbose ? err.stack : err.toString()),
                            err.getPath && err.getPath()
                        ));
                    }
                    // Rest Actions & Hooks
                    setActions(state.actions);
                    setHooks(state.hooks);
                }
                // Use the previous state
                return state;
            }
        , initialState);
    };
}

function getParents(type) {
    return (roc, state) => {
        let nextState = {...state};
        for (const parent of roc[type] || []) {
            nextState = getCompleteExtensionTree(getCompleteExtension(parent), parent, { ...nextState});
        }

        return nextState;
    };
}

function init(roc, state) {
    if (roc.init) {
        const result = roc.init({
            config: state.config,
            meta: state.meta,
            extensions: state.usedExtensions,
            actions: state.actions,
            hooks: state.hooks,
            currentDependencies: state.dependencies,
            currentCommands: state.commands,
            localDependencies: getDependencies(roc.name)
        });

        if (!result || isString(result)) {
            if (isString(result)) {
                throw new ExtensionError(
                    'There was a problem when running init. ' + result,
                    roc.name,
                    roc.version
                );
            } else {
                throw new ExtensionError(
                    'There was a problem when running init.',
                    roc.name,
                    roc.version
                );
            }
        }

        return manageRocObject(result, state);
    }

    return manageRocObject(roc, state);
}

function checkRequired(roc, state) {
    if (roc.required && state.checkRequired) {
        for (const dependency of Object.keys(roc.required)) {
            const required = state.usedExtensions.find((used) => used.name === dependency);
            if (!required) {
                throw new ExtensionError(
                    'Could not find required dependency.' +
                    `Needs ${dependency}@${roc.required[dependency]}`,
                    roc.name,
                    roc.version
                );
            }

            if (required.version && !semver.satisfies(required.version, roc.required[dependency])) {
                throw new ExtensionError(
                    'Current dependency version does not satisfy required version.\n' +
                    `Needs ${dependency}@${roc.required[dependency]}`,
                    roc.name,
                    roc.version
                );
            }
        }
    }

    return state;
}

function addPostInit(roc, state) {
    if (roc.postInit && !alreadyRegistered(roc.name, state)) {
        state.postInits.push({
            postInit: roc.postInit,
            name: roc.name
        });
    }

    return state;
}

function alreadyRegistered(name, state) {
    return state.usedExtensions.find((extension) => extension.name === name);
}

function registerExtension(roc, state) {
    const fromBefore = alreadyRegistered(roc.name, state);
    if (fromBefore) {
        if (fromBefore.version !== roc.version) {
            console.log(feedbackMessage(
                warningLabel('Warning', 'Multiple versions'),
                `Multiple versions for ${roc.name} was detected. (${roc.version} & ${fromBefore.version})\n` +
                `This might be an error.`
            ));
        }
    } else {
        state.usedExtensions.push({ name: roc.name, version: roc.version });
    }

    return state;
}

function getCompleteExtensionTree(roc, path, initialState) {
    return [
        validRocExtension(path),
        getParents('packages'),
        getParents('plugins'),
        checkRequired,
        init,
        addPostInit,
        registerExtension
    ].reduce(
        (state, process) => process(roc, state),
        initialState
    );
}

function updateDependencies(dependencies, name, path) {
    const local = { ...dependencies };
    Object.keys(local).forEach((dependency) => {
        if (isString(local[dependency])) {
            local[dependency] = {
                version: local[dependency]
            };
        }
        local[dependency] = {
            ...local[dependency],
            context: path,
            extension: name
        };
    });

    return local;
}

function setContext(dependencies, name, path) {
    return {
        ...dependencies,
        exports: updateDependencies(dependencies.exports, name, path),
        uses: updateDependencies(dependencies.uses, name, path),
        requires: updateDependencies(dependencies.requires, name, path)
    };
}

function manageRocObject(roc, state, post = false) {
    if (roc) {
        // Get possible dependencies
        if (!post) {
            // FIXME This will mean that we can create a "newDependencies" directly on the roc object...
            if (roc.newDependencies) {
                state.dependencies = roc.newDependencies;
            }

            setDependencies(roc.name, state.dependencies, roc.pkg, roc.path);

            if (roc.dependencies) {
                state.dependencies = merge(
                    state.dependencies,
                    setContext(roc.dependencies, roc.name, roc.path)
                );

                // If dev module save the exports for the extension for later reuse
                if (roc.dependencies.exports && /^.*-dev$/.test(roc.name)) {
                    setDevExports(roc.name, updateDependencies(roc.dependencies.exports, roc.name, roc.path));
                }
            }
        }

        // Get possible hooks
        if (roc.hooks) {
            registerHooks(roc.hooks, roc.name);
            state.hooks = getHooks();
        }

        // Get potential actions
        if (roc.actions) {
            registerActions(roc.actions, roc.name);
            state.actions = getActions();
        }

        // FIXME This will mean that we can create a "newDependencies" directly on the roc object...
        if (roc.newCommands) {
            state.commands = roc.newCommands;
        }

        // Get potential commands
        if (roc.commands) {
            const {
                commands,
                clearCommands
            } = manageCommands(roc.name, roc.commands, state.commands);
            state.commands = merge(
                merge(state.commands, clearCommands),
                commands
            );
        }

        // Build the config object
        // FIXME Remove this and depend on using the init function instead!
        if (roc.buildConfig) {
            const { config, meta } = roc.buildConfig(
                state.config,
                state.meta
            );
            state.config = config;
            state.meta = meta;
        } else {
            // If not buildConfig use config
            if (roc.config) {
                state.config = merge(
                    state.config,
                    roc.config
                );
            }

            // If not buildConfig use meta
            if (roc.meta) {
                state.meta = merge(
                    state.meta,
                    roc.meta
                );
            }
        }
    }

    return state;
}

function getCompleteExtension(extensionPath) {
    const getPackageJsonAndPath = (path) => {
        const dir = dirname(path);
        if (dir === path) {
            throw new Error('Could not find package.json for the extension at ' + extensionPath);
        }

        const pkg = join(dir, 'package.json');

        if (fileExists(pkg)) {
            const packageJson = require(pkg);
            return {
                path: dir,
                pkg: packageJson,
                version: packageJson.version,
                name: packageJson.name
            };
        }

        return getPackageJsonAndPath(dir);
    };

    const { standalone, ...roc } = require(extensionPath).roc;

    /*
     * roc.standalone can be used to avoid using the package.json
     *
     * This can be valuable if the extension not yet has become a real
     * npm module or if the automatic calculation of path and pkg is wrong.
     */
    if (standalone) {
        return {
            path: dirname(extensionPath),
            ...roc
        };
    }

    const { name, version, ...rest } = getPackageJsonAndPath(extensionPath);

    return {
        name,
        version,
        ...roc,
        ...rest
    };
}

function getExtension(extensionName, directory, type) {
    try {
        let path;
        if (extensionName.charAt(0) === '.' || extensionName.charAt(0) === '/') { // FIXME Windows?
            // We will use node-resolve if the path is relative or absolute
            path = resolve.sync(extensionName, { basedir: directory });
        } else {
            // We want to use _findPath if it is a module since this will follow symlinks
            path = _findPath(extensionName, [`${directory}/node_modules`]);

            if (!path) {
                path = _findPath(`roc-${type}-${extensionName}`, [`${directory}/node_modules`]);
            }

            if (!path) {
                throw new Error(`Cannot find module ${extensionName}`);
            }
        }

        return getCompleteExtension(path);
    } catch (err) {
        if (!/^Cannot find module/.test(err.message)) {
            throw err;
        }

        console.log(feedbackMessage(
            warningLabel('Warning', 'Roc Extension Loading Failed'),
            `Failed to load Roc ${type} named ${chalk.bold(extensionName)}.
Make sure you have it installed. Try running: ${chalk.underline('npm install --save ' + extensionName)}`
        ));
    }
}

function validRocExtension(path) {
    return (roc, state) => {
        if (!roc.name || !roc.version) {
            throw new ExtensionError(
                `Will ignore extension. Expected it to have a ${chalk.underline('name')} and ` +
                    `${chalk.underline('version')}.`,
                roc.name,
                roc.version,
                path
            );
        }

        if (
            !isAbstract(roc.name) &&
            !roc.packages &&
            !roc.plugins &&
            !roc.hooks &&
            !roc.actions &&
            !roc.buildConfig &&
            !roc.config &&
            !roc.meta &&
            !roc.init &&
            !roc.postInit
        ) {
            throw new ExtensionError(
                `Will ignore extension. Expected it to have at least one of the following:\n` +
                    [
                        '- config',
                        '- meta',
                        '- buildConfig',
                        '- actions',
                        '- hooks',
                        '- packages',
                        '- plugins',
                        '- init',
                        '- postInit'
                    ].join('\n'),
                roc.name,
                roc.version,
                path
            );
        }

        return state;
    };
}

function isAbstract(name) {
    return /roc-abstract/.test(name);
}
