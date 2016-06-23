import { isString } from 'lodash';

import { registerHooks } from '../../../hooks/manageHooks';
import { registerActions } from '../../../hooks/manageActions';
import merge from '../../../helpers/merge';
import validateSettings from '../../../validation/validateSettings';
import { initSetDependencies } from '../../../require/manageDependencies';

import processCommands from './processCommands';
import processConfig from './processConfig';

export default function processRocObject(roc, state, post = false) {
    if (roc) {
        // Get possible dependencies
        if (!post) {
            // FIXME This will mean that we can create a "newDependencies" directly on the roc object...
            if (roc.newDependencies) {
                state.context.dependencies = roc.newDependencies;
            }

            state.dependencyContext = initSetDependencies(state.dependencyContext)(
                    roc.name,
                    state.context.dependencies,
                    roc.pkg,
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

        // Get potential actions
        if (roc.actions) {
            state.context.actions = registerActions(roc.actions, roc.name, state.context.actions);
        }

        // FIXME This will mean that we can create a "newCommands" directly on the roc object...
        if (roc.newCommands) {
            state.context.commands = roc.newCommands;
        }

        // Get potential commands
        if (roc.commands) {
            state.context.commands = merge(
                state.context.commands,
                processCommands(roc.name, roc.commands, state.context.commands)
            );
        }

        const newState = processConfig(roc.name,
            {
                config: roc.config,
                meta: roc.meta
            }, {
                config: state.context.config,
                meta: state.context.meta
            }
        );

        state.context.config = newState.config;
        state.context.meta = newState.meta;

        // Build the config object
        // FIXME Remove this and depend on using the init function instead!
        if (roc.buildConfig) {
            const { config, meta } = roc.buildConfig(
                state.context.config,
                state.context.meta
            );
            state.context.config = config;
            state.context.meta = meta;
        } else {
            // If not buildConfig use config
            if (roc.config) {
                state.context.config = merge(
                    state.context.config,
                    roc.config
                );
            }

            // If not buildConfig use meta
            if (roc.meta) {
                state.context.meta = merge(
                    state.context.meta,
                    roc.meta
                );
            }
        }

        // Validate the configuration
        try {
            const settings = state.context.config || {};
            const metaSettings = state.context.meta || {};
            validateSettings(settings.settings, metaSettings.settings, true);
        } catch (error) {
            if (!/^Validation failed for field/.test(error.message)) {
                throw error;
            }

            throw new Error(
                'The configuration validation failed for the extension.\n' +
                `${error.message}\n` +
                `Contact the developer of ${roc.name} for help.`
            );
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
