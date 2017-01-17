import expect from 'expect';

import addRaw from '../../src/config/addRaw';

describe('configuration', () => {
    describe('addRaw', () => {
        it('should update configuration with values from RAW and remove it', () => {
            const initialConfig = {
                settings: {
                    group: {
                        property: {
                            a: 1,
                            __raw: {
                                a: 2,
                                b: 3,
                            },
                        },
                    },
                },
            };
            const newConfig = addRaw(initialConfig);

            expect(newConfig.settings.group.property).toEqual({
                a: 2,
                b: 3,
            });
        });
    });
});
