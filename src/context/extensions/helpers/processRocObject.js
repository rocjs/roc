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
            roc,
            context: undefined,
        };
    }

    return {
        roc: {
            ...roc,
            ...pick(result.roc, [
                'actions',
                'commands',
                'config',
                'dependencies',
                'hooks',
                'meta',
            ]),
        },
        context: result.context,
    };
}

/* eslint-disable no-param-reassign */
export default function processRocObject(
    { roc, context = {} },
    state,
    allowNewDependencies = true,
    allowUpdateDependencies = true,
    validate = true
) {
    if (roc) {
        // Get possible dependencies
        // Only possible to alter the dependencies in not post, this since modifying them in post will be to late for
        // things to be able to react to it.

        if (allowUpdateDependencies) {
            if (context.dependencies) {
                state.context.dependencies = context.dependencies;
            }
        }

        if (allowNewDependencies) {
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
            }

            // Store dev dependencies for later use
            if (/^.*-dev$/.test(roc.name)) {
                state.temp.extensionsDevelopmentExports[roc.name] =
                    state.context.dependencies.exports;
            }
        }

        // Get possible hooks
        if (roc.hooks) {
            state.context.hooks = registerHooks(roc.hooks, roc.name, state.context.hooks);
        }

        if (context.actions) {
            state.context.actions = context.actions;
        }

        // Get potential actions
        if (roc.actions) {
            state.context.actions = registerActions(roc.actions, roc.name, state.context.actions);
        }

        if (context.commands) {
            state.context.commands = context.commands;
        }

        // Get potential commands
        if (roc.commands) {
            state.context.commands = merge(
                state.context.commands,
                processCommands(roc.name, roc.commands, state.context.commands)
            );
        }

        if (context.config) {
            state.context.config = context.config;
        }

        if (context.meta) {
            state.context.meta = context.meta;
        }

        state.context.meta = processConfig(roc.name,
            {
                config: roc.config,
                meta: roc.meta,
            }, {
                config: state.context.config,
                meta: state.context.meta,
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
/* eslint-enable */

function updateDependencies(dependencies, name, path) {
    const local = { ...dependencies };
    Object.keys(local).forEach((dependency) => {
        if (isString(local[dependency])) {
            local[dependency] = {
                version: local[dependency],
            };
        }
        local[dependency] = {
            ...local[dependency],
            context: path,
            extension: name,
        };
    });

    return local;
}

function setContext(dependencies, name, path) {
    return {
        ...dependencies,
        exports: updateDependencies(dependencies.exports, name, path),
        uses: {
            [name]: updateDependencies(dependencies.uses, name, path),
        },
        requires: updateDependencies(dependencies.requires, name, path),
    };
}
