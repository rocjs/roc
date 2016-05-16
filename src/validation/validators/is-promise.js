import isProm from 'is-promise';
import infoObject from '../info-object';

/**
 * Validates a promise.
 *
 * @param {object} value - Something to validate.
 * @param {boolean} info - If type information should be returned.
 * @return {infoObject|boolean|string} - Type information or if it is valid.
 */
export default function isPromise(value, info) {
    if (info) {
        return infoObject({
            validator: 'Promise'
        });
    }

    if (value !== undefined && value !== null && !isProm(value)) {
        return 'Was not a Promise!';
    }

    return true;
}
