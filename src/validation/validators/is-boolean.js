import { isBoolean as isBooleanLodash } from 'lodash';
import infoObject from '../info-object';
import toBoolean from '../../converters/to-boolean';

/**
 * Validates an boolean.
 *
 * @param {object} value - Something to validate.
 * @param {boolean} info - If type information should be returned.
 * @return {infoObject|boolean|string} - Type information or if it is valid.
 */
export default function isBoolean(value, info) {
    if (info) {
        return infoObject({
            validator: 'Boolean',
            converter: () => toBoolean
        });
    }

    if (value !== undefined && value !== null && !isBooleanLodash(value)) {
        return 'Was not a boolean!';
    }

    return true;
}
