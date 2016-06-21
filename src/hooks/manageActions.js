import isFunction from 'lodash/isFunction';

// This needs to be global, same case as with configuration
global.roc = global.roc || {};
global.roc.actions = global.roc.actions || [];

/**
 * Register actions with Roc.
 *
 * @param {Object<rocAction>} actions - Object with actions.
 * @param {string} extensionName - Name of the extension to register the actions on.
 * @param {boolean} [project=false] - If the actions belongs to the project.
 */
export function registerActions(actions, extensionName, project = false) {
    // Look for the extensionName and only add if not already there
    const index = global.roc.actions.findIndex(({ name }) => extensionName === name);

    if (index === -1) {
        let extensionActions = {};
        Object.keys(actions).forEach((key) => {
            const action = isFunction(actions[key]) ?
                actions[key] :
                actions[key].action;

            extensionActions = {
                ...extensionActions,
                [key]: {
                    ...createActionHelper(
                        action,
                        actions[key].extension,
                        actions[key].hook,
                        actions[key].description,
                        actions[key].post
                    )
                }
            };
        });

        global.roc.actions = [].concat(global.roc.actions, {
            project,
            name: extensionName,
            actions: extensionActions
        });
    }
}

/**
 * Register single action with Roc.
 *
 * @param {function} action - The action function.
 * @param {string} actionName - The name of the action.
 * @param {string} extensionName - Name of the extension to register the actions on.
 * @param {boolean} [project=false] - If the action belongs to the project.
 */
export function registerAction(action, actionName, extensionName, project = false) {
    // Look for the extensionName and update if it exists
    const index = global.roc.actions.findIndex(({ name }) => extensionName === name);

    if (index !== -1) {
        global.roc.actions[index].actions = {
            ...global.roc.actions[index].actions,
            [actionName]: {
                ...createActionHelper(action)
            }
        };
    } else {
        global.roc.actions.push({
            project,
            name: extensionName,
            actions: {
                [actionName]: {
                    ...createActionHelper(action)
                }
            }
        });
    }
}

function createActionHelper(action, extension, hook, description, post) {
    return {
        action,
        extension,
        hook,
        description,
        post
    };
}

/**
 * Removes actions from Roc.
 *
 * @param {string} extensionToRemove - Name of the extension to remove registered actions for.
 * @param {string} actionToRemove - Name of the action to remove, if left undefined all actions for the extension will
 *  be removed.
 */
export function removeActions(extensionToRemove, actionToRemove) {
    if (!extensionToRemove) {
        throw new Error('You need to at least specify the extension to remove actions for.');
    }

    global.roc.actions
        .map((extension) => {
            if (!actionToRemove && extension.name !== extensionToRemove) {
                return extension;
            } else if (extension.name === extensionToRemove) {
                delete extension.actions[actionToRemove];
                return extension;
            }
        }).filter((element) => !!element);
}

/**
 * Gets the registered actions.
 *
 * @returns {Object[]} - The registered actions as an array where the order will be based on the order they registered
 *  themselves with Roc.
 */
export function getActions() {
    return global.roc.actions;
}

/**
 * Sets the registered actions.
 *
 * @param {Object[]} actions - The actions as an array where the order should be based on the order they registered
 *  themselves with Roc.
 */
export function setActions(actions) {
    global.roc.actions = actions;
}
