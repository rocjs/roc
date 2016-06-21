/* Using global variables here to make sure that we can access the values set from different projects.
 * This guarantees that the variables will live outside the require cache, something that we need for stability.
 */
global.roc = global.roc || {};
global.roc.verbose = global.roc.verbose || false;

/**
 * If verbose is enabled.
 *
 * @returns {boolean} - If verbose is enabled.
 */
export function isVerbose() {
    return global.roc.verbose;
}

/**
 * Set verbose state.
 *
 * @param {boolean} value - State to set verbose in.
 */
export function setVerbose(value) {
    global.roc.verbose = value;
}
