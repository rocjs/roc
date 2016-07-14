import { isFunction } from 'lodash';

export default function createInfoObject({
    validator = () => ({type: ''}),
    wrapper,
    required = false,
    canBeEmpty,
    converter
} = {}) {
    const info = isFunction(validator) ? validator(null, true) : { type: validator.toString(), canBeEmpty: null };
    const type = wrapper ? wrapper(info.type) : info.type;
    const convert = converter ? converter(info.converter) : info.converter;
    return {
        type,
        canBeEmpty: canBeEmpty === undefined ? info.canBeEmpty : canBeEmpty,
        required: info.required || required,
        converter: convert
    };
}
