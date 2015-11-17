// Test data covering basic config and metadata validation combinations
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
    validation: {
        port: () => false,
        path: () => true
    }
};

export const flatValidMetaConfig = {
    validation: {
        port: () => true,
        path: () => true
    }
};

export const flatMismatchMetaConfig = {
    validation: {
        thisiswrong: {
            port: () => true,
            path: () => true
        }
    }
};

export const nestedInvalidMetaConfig = {
    validation: {
        layer1: {
            port: () => false,
            layer2: {
                path: () => true
            }
        }
    }
};

export const nestedValidMetaConfig = {
    validation: {
        layer1: {
            port: () => true,
            layer2: {
                path: () => true
            }
        }
    }
};

export const nestedEvaluateMetaConfig = {
    validation: {
        layer1: {
            port: (value) => typeof value === 'number',
            layer2: {
                path: (value) => typeof value === 'string'
            }
        }
    }
};

export const flatRegexInvalidMetaConfig = {
    validation: {
        port: /1/,
        path: /\d+/
    }
};

export const flatRegexValidMetaConfig = {
    validation: {
        port: /\d+/,
        path: /\w+/
    }
};

export const nestedRegexInvalidMetaConfig = {
    validation: {
        layer1: {
            port: /1/,
            layer2: {
                path: /\d+/
            }
        }
    }
};

export const nestedRegexValidMetaConfig = {
    validation: {
        layer1: {
            port: /\d+/,
            layer2: {
                path: /\w+/
            }
        }
    }
};
