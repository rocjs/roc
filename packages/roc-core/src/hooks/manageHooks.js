import { getContext, setContext } from 'roc-context';

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
    return getContext().hooks;
}

/**
 * Sets the registered hooks.
 *
 * @param {Object} hooks - The hooks as an object where the key will be the extension they belong to.
 */
export function setHooks(hooks) {
    setContext({
        ...getContext(),
        hooks,
    });
}
