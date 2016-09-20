import { isFunction } from 'lodash';

import createInfoObject from './createInfoObject';

export default function getInfoObject(validator) {
    if (validator) {
        return isFunction(validator) ?
            validator(null, true) :
            { type: validator.toString() };
    }

    return createInfoObject();
}
