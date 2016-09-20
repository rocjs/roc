import expect from 'expect';

import processRocObject, { handleResult } from '../../../../src/context/extensions/helpers/processRocObject';
import defaultState from '../../fixtures/defaultState';

describe('context', () => {
    describe('extensions', () => {
        describe('helpers', () => {
            describe('handleResult', () => {
                it('should return back roc if result is undefined', () => {
                    const roc = {};
                    const response = handleResult(roc, undefined);
                    expect(response.roc).toBe(roc);
                    expect(response).toEqual({
                        roc,
                        newContext: undefined,
                    });
                });

                it('should overwrite props in roc from result.roc and provide context', () => {
                    const roc = {
                        name: 'test',
                        config: {
                            settings: {},
                        },
                    };
                    const result = {
                        roc: {
                            config: {
                                settings: {
                                    group: {
                                        property: true,
                                    },
                                },
                            },
                            notSupported: 123,
                        },
                        context: {
                            dependencies: {},
                        },
                    };
                    const response = handleResult(roc, result);
                    expect(response).toEqual({
                        roc: {
                            name: 'test',
                            config: result.roc.config,
                        },
                        newContext: {
                            dependencies: {},
                        },
                    });
                });
            });

            describe('processRocObject', () => {
                it('should handle dependencies correctly', () => {
                    expect(processRocObject({
                        roc: {
                            name: 'test-dev',
                            path: __dirname,
                            dependencies: {
                                exports: {
                                    lodash: '~4.0.0',
                                    react: {
                                        version: '^15.0.0',
                                    },
                                },
                                requires: {
                                    noop3: '*',
                                },
                                uses: {
                                    redux: '3.x',
                                },
                            },
                        },
                        context: {
                            dependencies: {},
                            actions: [],
                            hooks: {},
                            commands: {},
                            config: {},
                            meta: {},
                        },
                    }, { ...defaultState }).context.dependencies)
                        .toEqual({
                            exports: {
                                lodash: {
                                    context: __dirname,
                                    extension: 'test-dev',
                                    version: '~4.0.0',
                                },
                                react: {
                                    context: __dirname,
                                    extension: 'test-dev',
                                    version: '^15.0.0',
                                },
                            },
                            requires: {
                                noop3: {
                                    context: __dirname,
                                    extension: 'test-dev',
                                    version: '*',
                                },
                            },
                            uses: {
                                'test-dev': {
                                    redux: {
                                        context: __dirname,
                                        extension: 'test-dev',
                                        version: '3.x',
                                    },
                                },
                            },
                        });
                });
            });
        });
    });
});
