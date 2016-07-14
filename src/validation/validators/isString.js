import { isString as isStringLodash } from 'lodash';
import createInfoObject from '../helpers/createInfoObject';
import toString from '../../converters/toString';

/**
 * Validates an string.
 *
 * @param {object} value - Something to validate.
 * @param {boolean} info - If type information should be returned.
 * @return {infoObject|boolean|string} - Type information or if it is valid.
 */
export default function isString(value, info) {
    if (info) {
        return createInfoObject({
            validator: 'String',
            converter: () => toString,
            canBeEmpty: true
        });
    }

    if (value !== undefined && value !== null && !isStringLodash(value)) {
        return 'Was not a string!';
    }

    return true;
}
