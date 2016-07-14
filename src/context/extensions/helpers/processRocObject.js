import { isString, pick } from 'lodash';

import { registerHooks } from '../../../hooks/manageHooks';
import { registerActions } from '../../../hooks/manageActions';
import merge from '../../../helpers/merge';
import validateSettings from '../../../validation/validateSettings';
import { initSetDependencies } from '../../../require/manageDependencies';

import processCommands from './processCommands';
import processConfig from './processConfig';

export function handleResult(roc, result) {
    if (!result) {
        return {
            roc: undefined,
            update: undefined
        };
    }

    return {
        roc: {
            ...roc,
            ...pick(result.roc, [
                'action',
                'commands',
                'config',
                'dependencies',
                'hooks',
                'meta'
            ])
        },
        update: result.update
    };
}

export default function processRocObject({ roc, update = {} }, state, post = false, validate = true) {
    if (roc) {
        // Get possible dependencies
        // Only possible to alter the dependencies in not post, this since modifying them in post will be to late for
        // things to be able to react to it.
        if (!post) {
            if (update.dependencies) {
                state.context.dependencies = update.dependencies;
            }

            state.dependencyContext = initSetDependencies(state.dependencyContext)(
                    roc.name,
                    state.context.dependencies,
                    roc.packageJSON,
                    roc.path
                );

            if (roc.dependencies) {
                state.context.dependencies = merge(
                    state.context.dependencies,
                    setContext(roc.dependencies, roc.name, roc.path)
                );

                // If dev module save the exports for the extension for later reuse
                if (roc.dependencies.exports && /^.*-dev$/.test(roc.name)) {
                    state.temp.extensionsDevelopmentExports[roc.name] =
                        updateDependencies(roc.dependencies.exports, roc.name, roc.path);
                }
            }
        }

        // Get possible hooks
        if (roc.hooks) {
            state.context.hooks = registerHooks(roc.hooks, roc.name, state.context.hooks);
        }

        if (update.actions) {
            state.context.actions = update.actions;
        }

        // Get potential actions
        if (roc.actions) {
            state.context.actions = registerActions(roc.actions, roc.name, state.context.actions);
        }

        if (update.commands) {
            state.context.commands = update.commands;
        }

        // Get potential commands
        if (roc.commands) {
            state.context.commands = merge(
                state.context.commands,
                processCommands(roc.name, roc.commands, state.context.commands)
            );
        }

        if (update.config) {
            state.context.config = update.config;
        }

        if (update.meta) {
            state.context.meta = update.meta;
        }

        state.context.meta = processConfig(roc.name,
            {
                config: roc.config,
                meta: roc.meta
            }, {
                config: state.context.config,
                meta: state.context.meta
            }
        );

        if (roc.config) {
            state.context.config = merge(
                state.context.config,
                roc.config
            );
        }

        if (roc.meta) {
            state.context.meta = merge(
                state.context.meta,
                roc.meta
            );
        }

        // Validate the configuration
        if (validate) {
            try {
                const config = state.context.config || {};
                const meta = state.context.meta || {};
                validateSettings(config.settings, meta.settings, true);
            } catch (error) {
                if (!/^Validation failed for property/.test(error.message)) {
                    throw error;
                }
                throw new Error(
                    'The configuration validation failed for the extension.\n' +
                    `${error.message}\n` +
                    `Contact the developer of ${roc.name} for help.`
                );
            }
        }
    }

    return state;
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
