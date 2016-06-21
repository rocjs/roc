import { join, dirname } from 'path';
import { _findPath } from 'module';
import resolve from 'resolve';

import { bold, underline } from 'chalk';
import { isString } from 'lodash';
import semver from 'semver';

import merge from '../../../helpers/merge';
import { fileExists } from '../../../helpers';
import { setHooks } from '../../../hooks/manageHooks';
import { setActions } from '../../../hooks/manageActions';
import log from '../../../log/default/large';
import {
    getDependenciesObject,
    setDependenciesObject,
    getDependencies
} from '../../../dependencies/manageDependencies';
import ExtensionError from '../helpers/ExtensionError';
import processRocObject from '../helpers/processRocObject';

const rocPkg = require('../../../../package.json');

export default function getExtensions(type) {
    return (extensions, directory) => (initialState) => {
        return extensions.reduce(
            (state, extensionPath) => {
                // Get the extension
                const roc = getExtension(extensionPath, directory, type);

                if (roc) {
                    const previousDependencies = merge({}, getDependenciesObject());
                    try {
                        const nextState = getCompleteExtensionTree(
                            type,
                            roc,
                            extensionPath,
                            // Make sure no mutations are carried over
                            merge({}, state)
                        );

                        nextState.projectExtensions.push({
                            name: roc.name,
                            version: roc.version,
                            description: roc.description,
                            type
                        });

                        return nextState;
                    } catch (err) {
                        log.warn(
                            `Failed to load Roc ${type} ${bold(extensionPath)}`,
                            'Roc Extension Failed',
                            err
                        );
                    }

                    // Reset Actions & Hooks
                    setActions(state.actions);
                    setHooks(state.hooks);

                    // Reset dependencies
                    setDependenciesObject(previousDependencies);
                }
                // Use the previous state
                return state;
            }
        , initialState);
    };
}

function getExtension(extensionName, directory, type) {
    try {
        let path;
        // TODO Windows?
        if (extensionName.charAt(0) === '.' || extensionName.charAt(0) === '/') {
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

        log.warn(
            `Failed to load Roc ${type} named ${bold(extensionName)}.\n` +
                `Make sure you have it installed. Try running: ${underline('npm install --save ' + extensionName)}`,
            'Roc Extension Loading Failed',
            err
        );
    }
}

function getCompleteExtensionTree(type, roc, path, initialState) {
    return [
        validRocExtension(path),
        getParents('package'),
        getParents('plugin'),
        checkRequired,
        init,
        addPostInit,
        registerExtension(type)
    ].reduce(
        (state, process) => process(roc, state),
        initialState
    );
}

function validRocExtension(path) {
    return (roc, state) => {
        if (!roc.name || !roc.version) {
            throw new ExtensionError(
                `Will ignore extension. Expected it to have a ${underline('name')} and ` +
                    `${underline('version')}.`,
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

function getParents(type) {
    return (roc, state) => {
        let nextState = {...state};
        for (const parent of roc[type + 's'] || []) {
            nextState = getCompleteExtensionTree(type, getCompleteExtension(parent), parent, { ...nextState});
        }

        return nextState;
    };
}

function checkRequired(roc, state) {
    if (roc.required && state.checkRequired) {
        for (const dependency of Object.keys(roc.required)) {
            // Add roc to the usedExtensions to be able to require on that as well
            const required = [
                {name: 'roc', version: rocPkg.version },
                ...state.usedExtensions
            ].find((used) => used.name === dependency);
            if (!required) {
                throw new ExtensionError(
                    'Could not find required dependency. ' +
                    `Needs ${dependency}@${roc.required[dependency]}`,
                    roc.name,
                    roc.version
                );
            }

            if (required.version && !semver.satisfies(required.version, roc.required[dependency])) {
                throw new ExtensionError(
                    'Current dependency version does not satisfy required version.\n' +
                    `Needs ${dependency}@${roc.required[dependency]} and current version is ${required.version}`,
                    roc.name,
                    roc.version
                );
            }
        }
    }

    return state;
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

        return processRocObject(result, state);
    }

    return processRocObject(roc, state);
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

function registerExtension(type) {
    return (roc, state) => {
        const fromBefore = alreadyRegistered(roc.name, state);
        if (fromBefore) {
            if (fromBefore.version !== roc.version) {
                log.warn(
                    `Multiple versions for ${roc.name} was detected. (${roc.version} & ${fromBefore.version})\n` +
                        `This might be an error.`,
                    'Multiple versions'
                );
            }
        } else {
            state.usedExtensions.push({
                name: roc.name,
                version: roc.version,
                description: roc.description,
                type
            });
        }

        return state;
    };
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
