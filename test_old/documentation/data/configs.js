import { isString, required } from '../../../src/validation/validators';

export const config = {
    runtime: {
        option1: 'value1'
    },
    dev: {
        option2: ''
    }
};

export const metaConfig = {
    groups: {
        runtime: 'Runtime configuration'
    },
    descriptions: {
        runtime: {
            option1: 'description1'
        },
        dev: {
            option2: 'description2'
        }
    },
    validations: {
        runtime: {
            option1: isString
        },
        dev: {
            option2: required(isString)
        }
    }
};
