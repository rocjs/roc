// This will in relity be effected by the same things as config and hooks/actions.
// That means that it could have been global to make sure we have it defined everywhere but
// if it does not carry over we only loose some output, that we will consider that fine.
let verbose = false;

/**
 * If verbose is enabled.
 *
 * @returns {boolean} - If verbose is enabled.
 */
export function isVerbose() {
    return verbose;
}

/**
 * Set verbose state.
 *
 * @param {boolean} value - State to set verbose in.
 */
export function setVerbose(value) {
    verbose = value;
}
