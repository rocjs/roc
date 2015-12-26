// Test data covering basic config and metadata validations combinations
export const flatConfig = {
    port: 80,
    path: 'test'
};

export const nestedConfig = {
    layer1: {
        port: 80,
        layer2: {
            path: 'test'
        }
    }
};

export const flatInvalidMetaConfig = {
    validations: {
        port: () => false,
        path: () => true
    }
};

export const flatValidMetaConfig = {
    validations: {
        port: () => true,
        path: () => true
    }
};

export const flatMismatchMetaConfig = {
    validations: {
        thisiswrong: {
            port: () => true,
            path: () => true
        }
    }
};

export const nestedInvalidMetaConfig = {
    validations: {
        layer1: {
            port: () => false,
            layer2: {
                path: () => true
            }
        }
    }
};

export const nestedValidMetaConfig = {
    validations: {
        layer1: {
            port: () => true,
            layer2: {
                path: () => true
            }
        }
    }
};

export const nestedEvaluateMetaConfig = {
    validations: {
        layer1: {
            port: (value) => typeof value === 'number',
            layer2: {
                path: (value) => typeof value === 'string'
            }
        }
    }
};

export const flatRegexInvalidMetaConfig = {
    validations: {
        port: /1/,
        path: /\d+/
    }
};

export const flatRegexValidMetaConfig = {
    validations: {
        port: /\d+/,
        path: /\w+/
    }
};

export const nestedRegexInvalidMetaConfig = {
    validations: {
        layer1: {
            port: /1/,
            layer2: {
                path: /\d+/
            }
        }
    }
};

export const nestedRegexValidMetaConfig = {
    validations: {
        layer1: {
            port: /\d+/,
            layer2: {
                path: /\w+/
            }
        }
    }
};
