import { isString as isStringLodash } from 'lodash';
import createInfoObject from '../helpers/createInfoObject';
import toString from '../../converters/toString';

/**
 * Validates an path.
 *
 * @param {object} value - Something to validate.
 * @param {boolean} info - If type information should be returned.
 * @return {infoObject|boolean|string} - Type information or if it is valid.
 */
export default function isPath(value, info) {
    if (info) {
        return createInfoObject({
            validator: 'Filepath',
            converter: () => toString
        });
    }

    if (value !== undefined && value !== null && isStringLodash(value) !== true) {
        return 'Was not a filepath!';
    }

    return true;
}
