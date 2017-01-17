import { convert } from 'roc-converters';

import createInfoObject from './helpers/createInfoObject';
import isValid from './helpers/isValid';

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
            const types = [];
            const converters = [];

            validators.forEach((validator) => {
                const result = createInfoObject({ validator });
                types.push(result.type);
                if (result.converter) {
                    converters.push(result.converter);
                }
            });

            return createInfoObject({
                validator: types.join(' / '),
                converter: converters.length > 0 ? () => convert(...converters) : undefined,
            });
        }

        const invalid = [];
        // eslint-disable-next-line
        for (const validator of validators) {
            const result = isValid(input, validator);
            if (result === true) {
                return true;
            }
            invalid.push(validator(null, true).type || 'Unknown type');
        }

        /* eslint-disable prefer-template */
        return 'Was not any of the possible types:\n' +
            invalid.reduce((prev, next) => prev + '\n' + next, '');
    };
}
