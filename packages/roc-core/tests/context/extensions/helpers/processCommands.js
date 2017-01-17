import expect from 'expect';

import processCommands, { normalizeCommands } from '../../../../src/context/extensions/helpers/processCommands';

describe('context', () => {
    describe('extensions', () => {
        describe('helpers', () => {
            describe('normalizeCommands', () => {
                const commandsObject = {
                    meta: {
                        docs: {
                            command: () => {},
                        },
                        list: () => {},
                        extra: {
                            test: () => {},
                        },
                    },
                    run: 'git log',
                };

                it('should correctly update a commands object', () => {
                    expect(normalizeCommands('test', '/path', commandsObject)).toEqual({
                        meta: {
                            docs: {
                                command: commandsObject.meta.docs.command,
                                __context: '/path',
                                __extensions: [
                                    'test',
                                ],
                            },
                            list: {
                                command: commandsObject.meta.list,
                                __context: '/path',
                                __extensions: [
                                    'test',
                                ],
                            },
                            extra: {
                                test: {
                                    command: commandsObject.meta.extra.test,
                                    __context: '/path',
                                    __extensions: [
                                        'test',
                                    ],
                                },
                                __extensions: [
                                    'test',
                                ],
                            },
                            __extensions: [
                                'test',
                            ],
                        },
                        run: {
                            command: 'git log',
                            __context: '/path',
                            __extensions: [
                                'test',
                            ],
                        },
                    });
                });

                it('should handle when adding the same extension multiple times', () => {
                    const initalStateCommands = normalizeCommands('test', '/path', commandsObject);
                    expect(normalizeCommands('test', '/path', commandsObject, initalStateCommands)).toEqual({
                        meta: {
                            docs: {
                                command: commandsObject.meta.docs.command,
                                __context: '/path',
                                __extensions: [
                                    'test',
                                ],
                            },
                            list: {
                                command: commandsObject.meta.list,
                                __context: '/path',
                                __extensions: [
                                    'test',
                                ],
                            },
                            extra: {
                                test: {
                                    command: commandsObject.meta.extra.test,
                                    __context: '/path',
                                    __extensions: [
                                        'test',
                                    ],
                                },
                                __extensions: [
                                    'test',
                                ],
                            },
                            __extensions: [
                                'test',
                            ],
                        },
                        run: {
                            command: 'git log',
                            __context: '/path',
                            __extensions: [
                                'test',
                            ],
                        },
                    });
                });

                it('should handle adding a new extension', () => {
                    const initalStateCommands = normalizeCommands('test', '/path', commandsObject);
                    expect(normalizeCommands('test2', '/path2', commandsObject, initalStateCommands)).toEqual({
                        meta: {
                            docs: {
                                command: commandsObject.meta.docs.command,
                                __context: '/path2',
                                __extensions: [
                                    'test',
                                    'test2',
                                ],
                            },
                            list: {
                                command: commandsObject.meta.list,
                                __context: '/path2',
                                __extensions: [
                                    'test',
                                    'test2',
                                ],
                            },
                            extra: {
                                test: {
                                    command: commandsObject.meta.extra.test,
                                    __context: '/path2',
                                    __extensions: [
                                        'test',
                                        'test2',
                                    ],
                                },
                                __extensions: [
                                    'test',
                                    'test2',
                                ],
                            },
                            __extensions: [
                                'test',
                                'test2',
                            ],
                        },
                        run: {
                            command: 'git log',
                            __context: '/path2',
                            __extensions: [
                                'test',
                                'test2',
                            ],
                        },
                    });
                });
            });

            describe('processCommands', () => {
                const commandsObject = {
                    meta: {
                        docs: {
                            command: () => {},
                        },
                        list: () => {},
                        extra: {
                            test: () => {},
                        },
                    },
                    run: 'run',
                };

                it('should correctly handle collisions when no override has been provided', () => {
                    const initalStateCommands = normalizeCommands('test', '/path', commandsObject);
                    expect(() => processCommands('test2', '/path2', commandsObject, initalStateCommands)).toThrow();
                });

                it('should correctly handle collisions when the wrong override has been provided', () => {
                    const initalStateCommands = normalizeCommands('test', '/path', commandsObject);
                    expect(() => processCommands('test2', '/path2', {
                        run: {
                            command: 'git status',
                            __override: 'test3',
                        },
                    }, initalStateCommands)).toThrow();
                });

                it('should correctly handle collisions when the wrong override has been provided', () => {
                    const initalStateCommands = normalizeCommands('test', '/path', commandsObject);
                    expect(() => processCommands('test2', '/path2', {
                        run: {
                            command: 'git status',
                            override: 'test3',
                        },
                    }, initalStateCommands)).toThrow();
                });

                it('should correctly handle collisions when the correct override has been provided', () => {
                    const initalStateCommands = normalizeCommands('test', '/path', commandsObject);
                    const newStateCommand = processCommands('test2', '/path2', {
                        run: {
                            description: 'Gets the git log',
                            override: 'test',
                        },
                    }, initalStateCommands);
                    expect(newStateCommand.run).toEqual({
                        description: 'Gets the git log',
                        override: 'test',
                        __extensions: ['test', 'test2'],
                    });
                });
            });
        });
    });
});
