import { isFunction } from 'lodash';

export default function createInfoObject({
    validator = () => ({ type: '' }),
    wrapper,
    required = false,
    canBeEmpty,
    converter,
    unmanagedObject = false,
} = {}) {
    const info = isFunction(validator) ? validator(null, true) : { type: validator.toString(), canBeEmpty: null };
    const type = wrapper ? wrapper(info.type, info.canBeEmpty, info.required || false) : info.type;
    const convert = converter ? converter(info.converter) : info.converter;
    return {
        type,
        canBeEmpty: canBeEmpty === undefined ? info.canBeEmpty : canBeEmpty,
        required: info.required || required,
        converter: convert,
        unmanagedObject: info.unmanagedObject || unmanagedObject,
    };
}
