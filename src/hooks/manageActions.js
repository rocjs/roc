import isFunction from 'lodash/isFunction';

// This needs to be global, same case as with configuration
global.roc = global.roc || {};
global.roc.actions = global.roc.actions || [];

/**
 * Register actions with Roc.
 *
 * @param {rocAction[]} actions - Object with actions.
 * @param {string} extensionName - Name of the extension to register the actions on.
 * @param {boolean} [project=false] - If the actions belongs to the project.
 */
export function registerActions(actions, extensionName, state = global.roc.actions, project = false) {
    // Look for the extensionName and only add if not already there
    const index = state.findIndex(({ name }) => extensionName === name);

    if (index === -1) {
        let extensionActions = [];
        actions.forEach((actionObject) => {
            const action = isFunction(actionObject) ?
                actionObject :
                actionObject.action;

            extensionActions.push(createActionHelper(
                action,
                actionObject.extension,
                actionObject.hook,
                actionObject.description,
                actionObject.post
            ));
        });

        state = [].concat(state, {
            project,
            name: extensionName,
            actions: extensionActions
        });
    }

    return state;
}

/**
 * Register single action with Roc.
 *
 * @param {function} action - The action function.
 * @param {string} extensionName - Name of the extension to register the actions on.
 * @param {boolean} [project=false] - If the action belongs to the project.
 */
export function registerAction(action, extensionName, state = global.roc.actions, project = false) {
    // Look for the extensionName and update if it exists
    const index = state.findIndex(({ name }) => extensionName === name);

    if (index !== -1) {
        state[index].actions.push(createActionHelper(action));
    } else {
        state.push({
            project,
            name: extensionName,
            actions: [createActionHelper(action)]
        });
    }

    return state;
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

export function removeActions(state = global.roc.actions) {
    return (extensionToRemove, actionsForHookToRemove) => {
        if (!extensionToRemove) {
            throw new Error('You need to at least specify the extension to remove actions for.');
        }

        if (state.length === 0) {
            throw new Error('No actions has been added and can therefore not remove any.');
        }

        state = state
            .map((extension) => {
                if (extension.name !== extensionToRemove) {
                    return extension;
                }

                if (!actionsForHookToRemove) {
                    return undefined;
                }

                extension.actions = extension.actions.map((action) => {
                    if (action.hook !== actionForHookToRemove) {
                        return action
                    }
                }).filter((element) => !!element);

                return extension;
            }).filter((element) => !!element);

        return state;
    };
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
