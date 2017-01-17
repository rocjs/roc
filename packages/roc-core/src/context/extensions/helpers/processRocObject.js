import { isString, pick } from 'lodash';
import merge from 'roc-utils/lib/merge';
import validateSettings from 'roc-validators/lib/helpers/validateSettings';

import { registerHooks } from '../../../hooks/manageHooks';
import { registerActions } from '../../../hooks/manageActions';
import { initSetDependencies } from '../../../resolver/manageDependencies';

import processCommands from './processCommands';
import processConfig from './processConfig';

export function handleResult(roc, result) {
    if (!result) {
        return {
            roc,
            newContext: undefined,
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
        newContext: result.context,
    };
}

/* eslint-disable no-param-reassign */
export default function processRocObject(
    { roc, newContext = {} },
    state,
    allowNewDependencies = true,
    allowUpdateDependencies = true,
    validate = true,
) {
    if (roc) {
        // Get possible dependencies
        // Only possible to alter the dependencies in not post, this since modifying them in post will be to late for
        // things to be able to react to it.

        if (allowUpdateDependencies) {
            if (newContext.dependencies) {
                state.context.dependencies = newContext.dependencies;
            }
        }

        if (allowNewDependencies) {
            state.dependencyContext = initSetDependencies(state.dependencyContext)(
                roc.name,
                state.context.dependencies,
                roc.packageJSON,
                roc.path,
            );

            if (roc.dependencies) {
                state.context.dependencies = merge(
                    state.context.dependencies,
                    setContext(roc.dependencies, roc.name, roc.path),
                );
            }

            // Store dev dependencies for later use
            if (/^.*-dev$/.test(roc.name)) {
                state.temp.extensionsDevelopmentExports[roc.name] =
                    state.context.dependencies.exports;
            }

            if (!/^.*-dev$/.test(roc.name)) {
                state.temp.extensionsNormalExports[roc.name] =
                    state.context.dependencies.exports;
            }
        }

        // Get possible hooks
        if (roc.hooks) {
            state.context.hooks = registerHooks(roc.hooks, roc.name, state.context.hooks);
        }

        if (newContext.actions) {
            state.context.actions = newContext.actions;
        }

        // Get potential actions
        if (roc.actions) {
            state.context.actions = registerActions(roc.actions, roc.name, state.context.actions);
        }

        if (newContext.commands) {
            state.context.commands = newContext.commands;
        }

        // Get potential commands
        if (roc.commands) {
            state.context.commands = merge(
                state.context.commands,
                processCommands(roc.name, roc.path, roc.commands, state.context.commands),
            );
        }

        if (newContext.config) {
            state.context.config = newContext.config;
        }

        if (newContext.meta) {
            state.context.meta = newContext.meta;
        }

        state.context.meta = processConfig(roc.name,
            {
                config: roc.config,
                meta: roc.meta,
            }, {
                config: state.context.config,
                meta: state.context.meta,
            },
        );

        if (roc.config) {
            state.context.config = merge(
                state.context.config,
                roc.config,
            );
        }

        if (roc.meta) {
            state.context.meta = merge(
                state.context.meta,
                roc.meta,
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
                    `Contact the developer of ${roc.name} for help.`,
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
