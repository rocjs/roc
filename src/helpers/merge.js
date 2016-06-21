import deepExtend from 'deep-extend';

/**
 * Merges two configuration objects.
 *
 * @param {!Object} a - Configuration object to base the merge on.
 * @param {!Object} b - Configuration object that is merged into the first, overwriting the first one.
 *
 * @returns {Object} - The merged configuration object
 */
export default function merge(a, b) {
    return deepExtend({}, a, b);
}
