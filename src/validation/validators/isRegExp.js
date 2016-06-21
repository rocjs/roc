import { isRegExp as isRegExpLodash } from 'lodash';
import createInfoObject from '../helpers/createInfoObject';
import toRegExp from '../../converters/toRegExp';

/**
 * Validates a RegExp.
 *
 * @param {object} value - Something to validate.
 * @param {boolean} info - If type information should be returned.
 * @return {infoObject|boolean|string} - Type information or if it is valid.
 */
export default function isRegExp(value, info) {
    if (info) {
        return createInfoObject({
            validator: 'RegExp',
            converter: () => toRegExp
        });
    }

    if (value !== undefined && value !== null && !isRegExpLodash(value)) {
        return 'Was not a RegExp!';
    }

    return true;
}
