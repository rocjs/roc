import expect from 'expect';

import createInfoObject from '../../../src/validation/helpers/createInfoObject';

describe('roc', () => {
    describe('validation helpers', () => {
        describe('createInfoObject', () => {
            it('should create a correct default object', () => {
                expect(createInfoObject()).toEqual({
                    type: '',
                    canBeEmpty: undefined,
                    required: false,
                    converter: undefined,
                });
            });
        });
    });
});
