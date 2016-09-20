import { isFunction as isFunctionLodash } from 'lodash';

import createInfoObject from '../helpers/createInfoObject';

/**
 * Validates an function.
 *
 * @param {object} value - Something to validate.
 * @param {boolean} info - If type information should be returned.
 * @return {infoObject|boolean|string} - Type information or if it is valid.
 */
export default function isFunction(value, info) {
    if (info) {
        return createInfoObject({ validator: 'Function' });
    }

    if (value !== undefined && value !== null && !isFunctionLodash(value)) {
        return 'Was not a function!';
    }

    return true;
}
