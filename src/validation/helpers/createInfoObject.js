import { isFunction } from 'lodash';

export default function createInfoObject({
    validator = () => ({type: ''}),
    wrapper,
    required = false,
    notEmpty = false,
    converter
} = {}) {
    const info = isFunction(validator) ? validator(null, true) : { type: validator.toString() };
    const type = wrapper ? wrapper(info.type) : info.type;
    const convert = converter ? converter(info.converter) : info.converter;
    return {
        type,
        notEmpty: info.notEmpty || notEmpty,
        required: info.required || required,
        converter: convert
    };
}
