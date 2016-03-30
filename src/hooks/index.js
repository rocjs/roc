import chalk from 'chalk';

import { feedbackMessage, errorLabel } from '../helpers/style';
import { isValid, throwError } from '../validation';
import { isVerbose } from '../helpers/verbose';
import getSuggestions from '../helpers/get-suggestions';
import { getActions } from './actions';
import { getSettings } from '../configuration';

// This needs to be global, same case as with configuration
global.roc = global.roc || {};
global.roc.hooks = global.roc.hooks || {};

/**
 * Used to invoke a hook that have been initialized using registerHooks.
 *
 * @example
 * // First function takes the extension name, the second takes the hook name and possible
 * // arguments and the third will take a callback that will receive a single value.
 * // The callback is expected if "hasCallback" was set to true.
 * (extensionName) => (hookName, ...arguments) => (potentialCallback)
 *
 * @param {string} extensionName - The extension that the hook belongs to.
 *
 * @returns {function} - Will return a function that takes in the name of the hook and potential arguments.
 */
export function runHook(extensionName) {
    const hooks = global.roc.hooks[extensionName];

    if (!hooks) {
        console.log(feedbackMessage(
            errorLabel('Error', 'Hook problem'),
            'The given extension is not registered.\n\n' +
            getSuggestions([extensionName], Object.keys(global.roc.hooks))
        ));
        /* eslint-disable no-process-exit */
        process.exit(1);
        /* eslint-enable */
    }

    return (name, ...args) => {
        if (!hooks[name]) {
            console.log(feedbackMessage(
                errorLabel('Error', 'Hook problem'),
                'The given hook is not registered.\n\n' +
                getSuggestions([name], Object.keys(hooks))
            ));
            /* eslint-disable no-process-exit */
            process.exit(1);
            /* eslint-enable */
        }

        if (hooks[name].hasCallback) {
            return (callback) =>
                runHookDirectly({
                    ...hooks[name],
                    extension: extensionName,
                    name
                }, args, callback);
        }

        return runHookDirectly({
            ...hooks[name],
            extension: extensionName,
            name
        }, args);
    };
}

/**
 * Used to invoke a hook directly without needing to initialize using registerHooks.
 *
 * @example
 * // First function takes the extension name, the second takes the hook name and possible
 * // arguments and the third will take a callback that will receive a single value.
 * // The callback is expected if "hasCallback" was set to true.
 * (extensionName) => (hookName, ...arguments) => (potentialCallback)
 *
 * @param {Object} hookMeta - Meta data related to a hook.
 * @param {Object[]} args - Arguments to send to an action.
 * @param {function} callback - Callback to be used for the response of the action.
 *
 * @returns {function} - Will return a function that takes in the name of the hook and potential arguments.
 */
export function runHookDirectly({
        extension,
        name,
        description,
        returns,
        arguments: argumentsDefinitions,
        initialValue
    }, args, callback) {
    // Validate args
    if (argumentsDefinitions) {
        args.forEach((arg, i) => {
            const validationResult = isValid(arg, argumentsDefinitions[i].validation);
            if (validationResult !== true) {
                try {
                    throwError(argumentsDefinitions[i].name, validationResult, arg, 'argument');
                } catch (err) {
                    console.log(feedbackMessage(
                        errorLabel('Error', 'Hook problem'),
                        'A argument was not valid.\n\n' +
                        err.message
                    ));
                    /* eslint-disable no-process-exit */
                    process.exit(1);
                    /* eslint-enable */
                }
            }
        });
    }

    let previousValue = initialValue;

    getActions().forEach(({ name: actionExtensionName, actions }) => {
        Object.keys(actions).map((key) => {
            const action = actions[key];

            // Only run if no connection is made to a hook/extension or if they match
            if ((!action.extension || action.extension === extension) &&
                (!action.hook || action.hook === name)) {
                const createAction = action.action({
                    extension,
                    hook: name,
                    previousValue,
                    description,
                    settings: getSettings(),
                    verbose: isVerbose()
                });

                if (createAction) {
                    const performAction = createAction(...args);

                    if (performAction) {
                        previousValue = performAction();

                        if (isVerbose()) {
                            console.log(
                                `${chalk.magenta.bold('Hook')} - ` +
                                `Running hook defined in ${chalk.underline(extension)} ` +
                                `named ${chalk.underline(name)} ` +
                                `with ${chalk.underline(key)} added from ${chalk.underline(actionExtensionName)}`
                            );
                        }

                        if (returns) {
                            const validationResult = isValid(previousValue, returns);
                            if (validationResult !== true) {
                                try {
                                    throwError(key, validationResult, previousValue, 'return value of');
                                } catch (err) {
                                    console.log(feedbackMessage(
                                        errorLabel('Error', 'Hook problem'),
                                        'A return value was not valid.\n\n' +
                                        err.message
                                    ));
                                    /* eslint-disable no-process-exit */
                                    process.exit(1);
                                    /* eslint-enable */
                                }
                            }
                        }

                        if (callback) {
                            callback(previousValue);
                        }
                    }
                }
            }
        });
    });

    return previousValue;
}

/**
 * Register hooks with Roc.
 *
 * @param {Object} hooks - Object with hooks.
 * @param {string} name - Name of the extension that the hooks belongs to.
 */
export function registerHooks(hooks, name) {
    global.roc.hooks = {
        ...global.roc.hooks,
        [name]: hooks
    };
}

/**
 * Gets the registered hooks.
 *
 * @returns {Object} - The registered hooks as an object where the key will be the extension they belong to.
 */
export function getHooks() {
    return global.roc.hooks;
}
