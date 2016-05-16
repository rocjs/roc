import { isInteger as isIntegerLodash } from 'lodash';
import infoObject from '../info-object';
import toInteger from '../../converters/to-integer';

/**
 * Validates an integer.
 *
 * @param {object} value - Something to validate.
 * @param {boolean} info - If type information should be returned.
 * @return {infoObject|boolean|string} - Type information or if it is valid.
 */
export default function isInteger(value, info) {
    if (info) {
        return infoObject({
            validator: 'Integer',
            converter: () => toInteger
        });
    }

    if (value !== undefined && value !== null && !isIntegerLodash(value)) {
        return 'Was not an integer!';
    }

    return true;
}
