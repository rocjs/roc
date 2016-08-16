/* Using global variables here to make sure that we can access the values set from different projects.
 * This guarantees that the variables will live outside the require cache, something that we need for stability.
 */
global.roc = global.roc || {};
global.roc.context = global.roc.context || {};

export function getContext() {
    return global.roc.context;
}

export function setContext(context) {
    global.roc.context = context;
}
