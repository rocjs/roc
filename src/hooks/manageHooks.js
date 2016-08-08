// This needs to be global, same case as with configuration
global.roc = global.roc || {};
global.roc.hooks = global.roc.hooks || {};

/**
 * Register hooks with Roc.
 *
 * @param {Object} hooks - Object with hooks.
 * @param {string} name - Name of the extension that the hooks belongs to.
 */
export function registerHooks(hooks, name, state = global.roc.hooks) {
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
    return global.roc.hooks;
}

/**
 * Sets the registered hooks.
 *
 * @param {Object} hooks - The hooks as an object where the key will be the extension they belong to.
 */
export function setHooks(hooks) {
    global.roc.hooks = hooks;
}
