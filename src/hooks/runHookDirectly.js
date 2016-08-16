import { magenta, underline } from 'chalk';

import log from '../log/default';
import isValid from '../validation/helpers/isValid';
import throwValidationError from '../validation/helpers/throwValidationError';
import { getContext } from '../context/helpers/manageContext';

import { getActions } from './manageActions';

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
export default function runHookDirectly({
        arguments: argumentsDefinitions,
        description,
        extension,
        initialValue,
        name,
        returns,
    }, args = [], callback) {
    // Validate args
    if (argumentsDefinitions) {
        args.forEach((value, i) => {
            const validationResult = isValid(value, argumentsDefinitions[i].validator);
            if (validationResult !== true) {
                try {
                    throwValidationError(argumentsDefinitions[i].name, validationResult, value, 'argument');
                } catch (err) {
                    log.large.error(
                        `An argument was not valid in ${underline(name)} from ${underline(extension)}.` +
                            `\n\n${err.message}`,
                        'Hook problem'
                    );
                }
            }
        });
    }

    let previousValue = initialValue;
    const postActions = [];

    getActions().forEach(({ name: actionExtensionName, actions }) => {
        actions.forEach((action) => {
            // Only run if no connection is made to a hook/extension or if they match
            if ((!action.extension || action.extension === extension) &&
                (!action.hook || action.hook === name)) {
                const initAction = (currentAction) => (post = false) => {
                    // Run actions in a semi-managed way
                    let step = 'first';
                    try {
                        const createAction = currentAction({
                            context: getContext(),
                            description,
                            extension,
                            hook: name,
                            previousValue,
                        });
                        step = 'second';

                        if (createAction) {
                            const performAction = createAction(...args);
                            step = 'third';

                            if (performAction) {
                                if (getContext().verbose) {
                                    const isPost = post ? '[Post] ' : '';
                                    log.small.info(
                                        `${magenta('Hook')} - ` +
                                        `${isPost}Running hook defined in ${underline(extension)} ` +
                                        `named ${underline(name)} with action from ${underline(actionExtensionName)}`
                                    );
                                }

                                previousValue = performAction();

                                if (returns) {
                                    const validationResult = isValid(previousValue, returns);
                                    if (validationResult !== true) {
                                        try {
                                            throwValidationError(
                                                `action in ${actionExtensionName} for ${name}`,
                                                validationResult,
                                                previousValue,
                                                'return value of'
                                            );
                                        } catch (err) {
                                            log.large.error(
                                                `A return value was not valid.\n\n${err.message}`,
                                                'Hook problem'
                                            );
                                        }
                                    }
                                }

                                if (callback) {
                                    callback(previousValue);
                                }
                            }
                        }
                    } catch (error) {
                        if (getContext().verbose) {
                            const isPost = post ? '[Post] ' : '';
                            log.small.warn(
                                `${magenta('Hook')} - ` +
                                `${isPost}An error happened when running the hook defined in ${underline(extension)} ` +
                                `named ${underline(name)} with action from ${underline(actionExtensionName)} in the ` +
                                `${step} function.`,
                                error
                            );
                        }

                        throw error;
                    }
                };

                if (action.post) {
                    postActions.unshift(initAction(action.post));
                }

                initAction(action.action)();
            }
        });
    });

    postActions.forEach((runAction) => runAction(true));

    return previousValue;
}
