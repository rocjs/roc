import expect from 'expect';

import isCommandGroup from '../src/isCommandGroup';

describe('cli', () => {
    describe('commands', () => {
        describe('helpers', () => {
            describe('isCommandGroup', () => {
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

                it('should correctly identify command groups', () => {
                    expect(isCommandGroup(commandsObject)('run')).toBeFalsy();
                    expect(isCommandGroup(commandsObject)('meta')).toBeTruthy();

                    expect(isCommandGroup(commandsObject.meta)('docs')).toBeFalsy();
                    expect(isCommandGroup(commandsObject.meta)('list')).toBeFalsy();
                    expect(isCommandGroup(commandsObject.meta)('extra')).toBeTruthy();
                });
            });
        });
    });
});
