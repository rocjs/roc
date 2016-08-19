import expect from 'expect';

import processConfig from '../../../../src/context/extensions/helpers/processConfig';

describe('context', () => {
    describe('extensions', () => {
        describe('helpers', () => {
            describe('processConfig', () => {
                const extension = {
                    config: {
                        settings: {
                            group: {
                                property: true,
                            },
                            group2: {
                                group3: {
                                    property2: false,
                                },
                            },
                        },

                        webpack: {},
                    },

                    meta: {

                    },
                };

                it('should process extension correctly from an empty state', () => {
                    expect(processConfig('test', extension, { config: {}, meta: {} })).toEqual({
                        settings: {
                            group: {
                                __extensions: [
                                    'test',
                                ],
                                property: {
                                    __extensions: [
                                        'test',
                                    ],
                                },
                            },
                            group2: {
                                __extensions: [
                                    'test',
                                ],
                                group3: {
                                    __extensions: [
                                        'test',
                                    ],
                                    property2: {
                                        __extensions: [
                                            'test',
                                        ],
                                    },
                                },
                            },
                        },
                        webpack: {
                            __extensions: [
                                'test',
                            ],
                        },
                    });
                });

                it('should manage the same extension multiple times', () => {
                    const updatedMeta = processConfig('test', extension, { config: {}, meta: {} });
                    expect(processConfig('test', extension, { config: {}, meta: updatedMeta })).toEqual({
                        settings: {
                            group: {
                                __extensions: [
                                    'test',
                                ],
                                property: {
                                    __extensions: [
                                        'test',
                                    ],
                                },
                            },
                            group2: {
                                __extensions: [
                                    'test',
                                ],
                                group3: {
                                    __extensions: [
                                        'test',
                                    ],
                                    property2: {
                                        __extensions: [
                                            'test',
                                        ],
                                    },
                                },
                            },
                        },
                        webpack: {
                            __extensions: [
                                'test',
                            ],
                        },
                    });
                });

                it('should manage a new extension to existing state', () => {
                    const updatedMeta = processConfig('test', extension, { config: {}, meta: {} });
                    expect(processConfig('test2', {
                        config: {
                            settings: {
                                group2: true,
                            },
                        },
                        meta: {
                            settings: {
                                group: {
                                    __meta: {
                                        description: 'A description',
                                        override: true,
                                    },
                                },
                                group2: {
                                    override: true,
                                },
                            },
                        },
                    }, { config: extension.config, meta: updatedMeta })).toEqual({
                        settings: {
                            group: {
                                __extensions: [
                                    'test',
                                    'test2',
                                ],
                                property: {
                                    __extensions: [
                                        'test',
                                    ],
                                },
                            },
                            group2: {
                                __extensions: [
                                    'test2',
                                ],
                            },
                        },
                        webpack: {
                            __extensions: [
                                'test',
                            ],
                        },
                    });
                });

                it('should not throw if no override is provided and only the value has been changed', () => {
                    const updatedMeta = processConfig('test', extension, { config: {}, meta: {} });
                    processConfig('test2', {
                        config: {
                            settings: {
                                group: {
                                    property: false,
                                },
                            },
                        },
                    }, { config: extension.config, meta: updatedMeta });
                });

                it('should throw if no override is provided and changed type', () => {
                    const updatedMeta = processConfig('test', extension, { config: {}, meta: {} });
                    expect(() => processConfig('test2', {
                        config: {
                            settings: {
                                group: {
                                    property: {
                                        value: true,
                                    },
                                },
                            },
                        },
                    }, { config: extension.config, meta: updatedMeta }))
                        .toThrow(/Was a value and is now an object/);
                });

                it('should throw if no override is provided and meta changed', () => {
                    const updatedMeta = processConfig('test', extension, { config: {}, meta: {} });
                    expect(() => processConfig('test2', {
                        meta: {
                            settings: {
                                group: {
                                    __meta: {
                                        description: 'A description',
                                    },
                                },
                            },
                        },
                    }, { config: extension.config, meta: updatedMeta }))
                        .toThrow(/Meta structure was changed without specifying override/);
                });
            });
        });
    });
});
