import chalk from 'chalk';
import resolve from 'resolve';
import { isString } from 'lodash';
import semver from 'semver';

import { registerHooks, getHooks, setHooks } from '../../hooks';
import { registerActions, getActions, setActions } from '../../hooks/actions';
import { merge } from '../../configuration';
import { warningLabel, feedbackMessage } from '../../helpers/style';
import ExtensionError from './error';

const debug = require('debug')('roc:core:cli:extensions');

export function runPostInits(initialState) {
    debug('Running post inits.');
    return initialState.postInits.reduce(
        (state, postInit) =>
            manageRocObject(
                postInit({
                    config: state.config,
                    meta: state.meta,
                    extensions: state.usedExtensions,
                    actions: state.actions,
                    hooks: state.hooks
                }), state
            ),
        initialState
    );
}

export function getExtensions(type) {
    return (extensions, directory) => (initialState) => {
        debug('Getting extensions for type \'%s\'', type);

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
    debug('Getting parents for type \'%s\'', type);
    return (roc, state) => {
        let nextState = {...state};
        for (const parent of roc[type] || []) {
            nextState = getCompleteExtensionTree(require(parent).roc, parent, { ...nextState});
        }

        return nextState;
    };
}

function init(roc, state) {
    debug('Running init.');

    if (roc.init) {
        const result = roc.init({
            config: state.config,
            meta: state.meta,
            extensions: state.usedExtensions,
            actions: state.actions,
            hooks: state.hooks
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

function checkDependencies(roc, state) {
    debug('Running checkDependencies.');

    if (roc.dependencies && state.checkDependencies) {
        for (const dependency of Object.keys(roc.dependencies)) {
            const required = state.usedExtensions.find((used) => used.name === dependency);
            if (!required) {
                throw new ExtensionError(
                    'Could not find required dependency.' +
                    `Needs ${dependency}@${roc.dependencies[dependency]}`,
                    roc.name,
                    roc.version
                );
            }

            if (required.version && !semver.satisfies(required.version, roc.dependencies[dependency])) {
                throw new ExtensionError(
                    'Current dependency version does not satisfy required version.\n' +
                    `Needs ${dependency}@${roc.dependencies[dependency]}`,
                    roc.name,
                    roc.version
                );
            }
        }
    }

    return state;
}

function addPostInit(roc, state) {
    if (roc.postInit) {
        state.postInits.push(roc.postInit);
    }

    return state;
}

function registerExtension(roc, state) {
    const fromBefore = state.usedExtensions.find((extension) => extension.name === roc.name);
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
        checkDependencies,
        init,
        addPostInit,
        registerExtension
    ].reduce(
        (state, process) => process(roc, state),
        initialState
    );
}

function manageRocObject(roc, state) {
    if (roc) {
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

        // Build the config object
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

function getExtension(extensionName, directory, type) {
    debug('Loading extension \'%s\'', extensionName);

    try {
        return require(resolve.sync(extensionName, { basedir: directory })).roc;
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
        debug('Asserting extension validity for %s', path);

        if (!roc.name) {
            throw new ExtensionError(
                `Will ignore extension. Expected it to have a ${chalk.underline('name')}.`,
                roc.name,
                roc.version,
                path
            );
        }

        if (
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
