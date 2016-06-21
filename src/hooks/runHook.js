import log from '../log/default/large';
import getSuggestions from '../helpers/getSuggestions';

import { getHooks } from './manageHooks';
import runHookDirectly from './runHookDirectly';

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
export default function runHook(extensionName) {
    const allHooks = getHooks();
    const extensionHooks = allHooks[extensionName];

    if (!extensionHooks) {
        log.error(
            'The given extension is not registered.\n\n' +
                getSuggestions([extensionName], Object.keys(allHooks)),
            'Hook problem'
        );
    }

    return (name, ...args) => {
        if (!extensionHooks[name]) {
            log.error(
                'The given hook is not registered.\n\n' +
                    getSuggestions([name], Object.keys(extensionHooks)),
                'Hook problem'
            );
        }

        if (extensionHooks[name].hasCallback) {
            return (callback) =>
                runHookDirectly({
                    ...extensionHooks[name],
                    extension: extensionName,
                    name
                }, args, callback);
        }

        return runHookDirectly({
            ...extensionHooks[name],
            extension: extensionName,
            name
        }, args);
    };
}
