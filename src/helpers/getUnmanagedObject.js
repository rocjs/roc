import { isFunction } from 'lodash';

export default function getUnmanagedObject(validator) {
    if (validator && isFunction(validator)) {
        return !validator(null, true).unmanagedObject;
    }

    return true;
}
