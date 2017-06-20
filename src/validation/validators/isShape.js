import { isPlainObject, difference } from 'lodash';

import createInfoObject from '../helpers/createInfoObject';
import getSuggestions from '../../helpers/getSuggestions';
import isValid from '../helpers/isValid';
import toObject from '../../converters/toObject';
import writeInfoInline from '../helpers/writeInfoInline';

export default function isShape(shape, { strict = true } = {}) {
    if (!shape || !isPlainObject(shape) || Object.keys(shape).length === 0) {
        throw new Error('The isShape validator requires that a shape object is defined.');
    }

    return (input, info) => {
        const keys = Object.keys(shape);

        if (info) {
            const types = Object.keys(shape).map((key) => createInfoObject({
                validator: shape[key],
                wrapper: (...args) => `${key}: ${writeInfoInline(...args)}`,
            }).type).join(', ');

            // We do not need a speical converter, since there will never be the case that we
            // have a input that is not on the ordinary object form, meaning that we will accept
            // whatever we get back from it.
            // In addtion to this we should not use this validator for something we get on the
            // command line since we have better ways to manage shape like object there.
            return createInfoObject({
                validator: types,
                converter: () => toObject,
                wrapper: (wrap) => `{ ${wrap} }`,
                canBeEmpty: true,
            });
        }

        if (input === undefined || input === null) {
            return true;
        }

        if (!isPlainObject(input)) {
            return 'Was not an object and can therefore not have a shape!';
        }


        for (const key of keys) {
            const result = isValid(input[key], shape[key]);

            if (result !== true) {
                if (isPlainObject(result)) {
                    return {
                        key: `${key}.${result.key}`,
                        value: result.value,
                        message: result.message,
                    };
                }
                return {
                    key: `${key}`,
                    value: input[key],
                    message: result,
                };
            }
        }

        if (strict) {
            const diff = difference(Object.keys(input), keys);

            if (diff.length > 0) {
                return `Unknown propertys where found, make sure this is correct.\n${getSuggestions(diff, keys)}`;
            }
        }

        return true;
    };
}
