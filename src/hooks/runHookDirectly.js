import { magenta, underline } from 'chalk';

import log from '../log/default/large';
import isValid from '../validation/helpers/isValid';
import throwValidationError from '../validation/helpers/throwValidationError';
import { isVerbose } from '../helpers/manageVerbose';
import { getConfig } from '../configuration/manageConfig';
import { getSettings } from '../configuration/manageSettings';

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
        extension,
        name,
        description,
        returns,
        arguments: argumentsDefinitions,
        initialValue
    }, args = [], callback) {
    // Validate args
    if (argumentsDefinitions) {
        args.forEach((value, i) => {
            if (value !== undefined) {
                const validationResult = isValid(value, argumentsDefinitions[i].validation);
                if (validationResult !== true) {
                    try {
                        throwValidationError(argumentsDefinitions[i].name, validationResult, value, 'argument');
                    } catch (err) {
                        log.error(
                            'A argument was not valid.\n\n' +
                                err.message,
                            'Hook problem'
                        );
                    }
                }
            }
        });
    }

    let previousValue = initialValue;
    const postActions = [];

    getActions().forEach(({ name: actionExtensionName, actions }) => {
        Object.keys(actions).map((key) => {
            const action = actions[key];

            // Only run if no connection is made to a hook/extension or if they match
            if ((!action.extension || action.extension === extension) &&
                (!action.hook || action.hook === name)) {
                const initAction = (currentAction) => (post = false) => {
                    const createAction = currentAction({
                        extension,
                        hook: name,
                        previousValue,
                        description,
                        settings: getSettings(),
                        config: getConfig(),
                        verbose: isVerbose()
                    });

                    if (createAction) {
                        const performAction = createAction(...args);

                        if (performAction) {
                            if (isVerbose()) {
                                const isPost = post ? '[Post] ' : '';
                                // FIXME
                                console.log(
                                    `${magenta('Hook')} - ` +
                                    `${isPost}Running hook defined in ${underline(extension)} ` +
                                    `named ${underline(name)} ` +
                                    `with ${underline(key)} added from ${underline(actionExtensionName)}`
                                );
                            }

                            previousValue = performAction();

                            if (returns) {
                                const validationResult = isValid(previousValue, returns);
                                if (validationResult !== true) {
                                    try {
                                        throwValidationError(key, validationResult, previousValue, 'return value of');
                                    } catch (err) {
                                        log.error(
                                            'A return value was not valid.\n\n' +
                                                err.message,
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
