import { isBoolean, isString, isRegExp } from 'lodash';
import { toArray, toRegExp, toBoolean, toInteger, toObject } from '../converters';

export default function automaticConverter(value, name) {
    if (isBoolean(value)) {
        return (input) => toBoolean(input, value, name);
    } else if (isRegExp(value)) {
        return toRegExp;
    } else if (Array.isArray(value)) {
        return toArray;
    } else if (Number.isInteger(value)) {
        return toInteger;
    } else if (!isString(value) && (!value || Object.keys(value).length === 0)) {
        return toObject;
    }

    return (input) => input;
}
