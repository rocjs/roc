import infoObject from '../info-object';
import convert from '../../converters/convert';
import { isValid } from '../index.js';

/**
 * Validates against a list of validators.
 *
 * @param {...function} validators - Validators to validate against.
 * @return {function} - A function that takes a value and that returns true or false if valid or not.
 */
export default function oneOf(...validators) {
    if (!validators.length) {
        throw new Error('You need to use at least one validator.');
    }

    return (input, info) => {
        if (info) {
            let types = [];
            let converters = [];
            for (const validator of validators) {
                const result = infoObject({ validator });
                types.push(result.type);
                if (result.converter) {
                    converters.push(result.converter);
                }
            }
            return infoObject({
                validator: types.join(' / '),
                converter: converters.length > 0 ? () => convert(...converters) : undefined
            });
        }

        const invalid = [];
        for (const validator of validators) {
            const result = isValid(input, validator);
            if (result === true) {
                return true;
            }
            invalid.push(validator(null, true).type);
        }

        return 'Was not any of the possible types:\n' +
            invalid.reduce((prev, next) => prev + '\n' + next, '');
    };
}
