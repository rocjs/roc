// This needs to be global, same case as with configuration
global.roc = global.roc || {};
global.roc.context = global.roc.context || {};
global.roc.context.hooks = global.roc.context.hooks || {};

/**
 * Register hooks with Roc.
 */
export function registerHooks(hooks, name, state = global.roc.context.hooks) {
    // eslint-disable-next-line
    state = {
        ...state,
        [name]: hooks,
    };

    return state;
}

/**
 * Gets the registered hooks.
 *
 * @returns {Object} - The registered hooks as an object where the key will be the extension they belong to.
 */
export function getHooks() {
    return global.roc.context.hooks;
}

/**
 * Sets the registered hooks.
 *
 * @param {Object} hooks - The hooks as an object where the key will be the extension they belong to.
 */
export function setHooks(hooks) {
    global.roc.context.hooks = hooks;
}
