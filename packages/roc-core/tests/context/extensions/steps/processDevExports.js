import expect from 'expect';

import processDevExports from '../../../../src/context/extensions/steps/processDevExports';
import defaultState from '../../fixtures/defaultState';

describe('context', () => {
    describe('extensions', () => {
        describe('steps', () => {
            describe('processDevExports', () => {
                it('should return back the same state if no dev exports exist', () => {
                    expect(processDevExports({ ...defaultState })).toEqual(defaultState);
                });

                it('should update non-dev extension with dev extension dependency context', () => {
                    const state = {
                        ...defaultState,
                        context: {
                            ...defaultState.context,
                            usedExtensions: [{ name: 'a' }],
                        },
                        dependencyContext: {
                            extensionsDependencies: {
                                a: {
                                    exports: {},
                                    requires: {},
                                    uses: {},
                                },
                            },
                            pathsToExtensions: {
                                a: __dirname,
                            },
                        },
                        temp: {
                            ...defaultState.temp,
                            extensionsDevelopmentExports: {
                                'a-dev': {
                                    lodash: {
                                        version: '~4.0.0',
                                    },
                                },
                            },
                        },
                    };

                    expect(processDevExports(state).dependencyContext.extensionsDependencies).toEqual({
                        a: {
                            exports: {
                                lodash: {
                                    version: '~4.0.0',
                                },
                            },
                            requires: {},
                            uses: {},
                        },
                    });
                });
            });
        });
    });
});
