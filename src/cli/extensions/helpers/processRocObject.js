import { isString } from 'lodash';

import { registerHooks, getHooks } from '../../../hooks/manageHooks';
import { registerActions, getActions } from '../../../hooks/manageActions';
import merge from '../../../helpers/merge';
import validateSettings from '../../../validation/validateSettings';
import { setDependencies, setDevExports } from '../../../dependencies/manageDependencies';

import processCommands from './processCommands';
import processConfig from './processConfig';

export default function processRocObject(roc, state, post = false) {
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
            state.commands = merge(
                state.commands,
                processCommands(roc.name, roc.commands, state.commands)
            );
        }

        const newState = processConfig(roc.name,
            {
                config: roc.config,
                meta: roc.meta
            }, {
                config: state.config,
                meta: state.meta
            }
        );

        state.config = newState.config;
        state.meta = newState.meta;

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

        // Validate the configuration
        try {
            const settings = state.config || {};
            const metaSettings = state.meta || {};
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
