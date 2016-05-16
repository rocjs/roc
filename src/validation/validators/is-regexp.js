import { isRegExp as isRegExpLodash } from 'lodash';
import infoObject from '../info-object';
import toRegExp from '../../converters/to-regexp';

/**
 * Validates a RegExp.
 *
 * @param {object} value - Something to validate.
 * @param {boolean} info - If type information should be returned.
 * @return {infoObject|boolean|string} - Type information or if it is valid.
 */
export default function isRegExp(value, info) {
    if (info) {
        return infoObject({
            validator: 'RegExp',
            converter: () => toRegExp
        });
    }

    if (value !== undefined && value !== null && !isRegExpLodash(value)) {
        return 'Was not a RegExp!';
    }

    return true;
}
