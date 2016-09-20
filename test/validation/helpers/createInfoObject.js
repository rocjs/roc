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

            it('should create object with expected values when given a validator that provides info', () => {
                const stubConverter = () => {};
                const info = {
                    type: 'testtype',
                    canBeEmpty: true,
                    required: true,
                    converter: stubConverter,
                };

                const validatorProvidingInfo = () => info;

                expect(
                    createInfoObject({
                        validator: validatorProvidingInfo,
                    })
                ).toEqual(info);
            });
        });
    });
});
