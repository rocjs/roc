import expect from 'expect';

import isCommand from '../src/isCommand';

describe('cli', () => {
    describe('commands', () => {
        describe('helpers', () => {
            describe('isCommand', () => {
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

                it('should correctly identify commands', () => {
                    expect(isCommand(commandsObject)('run')).toBeTruthy();
                    expect(isCommand(commandsObject)('meta')).toBeFalsy();

                    expect(isCommand(commandsObject.meta)('docs')).toBeTruthy();
                    expect(isCommand(commandsObject.meta)('list')).toBeTruthy();
                    expect(isCommand(commandsObject.meta)('extra')).toBeFalsy();

                    expect(isCommand(commandsObject.meta.extra)('test')).toBeTruthy();
                });
            });
        });
    });
});
