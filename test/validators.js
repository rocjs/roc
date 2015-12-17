import chai from 'chai';
import * as validators from '../src/validation/validators';

chai.should();

describe('roc-config', () => {
    describe('validators', () => {
        describe('isObject', () => {
            it('must validate plain object as true', () => {
                const testData = {};
                validators.isObject()(testData)
                    .should.equal(true);
            });

            it('must validate array as false', () => {
                const testData = [];
                validators.isObject()(testData)
                    .should.equal('Was not an object!');
            });

            it('must validate complex object as true', () => {
                const testData = {
                    a: ['/some/path']
                };
                validators.isObject(validators.isArray(validators.isPath))(testData)
                    .should.equal(true);
            });
        });

        describe('oneOf', () => {
            it('must handle 1 validator', () => {
                const anObject = {};
                validators.oneOf(
                    validators.isObject()
                )(anObject)
                    .should.equal(true);

                const anInt = 2;
                validators.oneOf(
                    validators.isObject()
                )(anInt)
                    .should.equal('Was not any of the possible types:\n\nWas not an object!');
            });

            it('must handle 2 validator', () => {
                const anObject = {};
                validators.oneOf(
                    validators.isArray(),
                    validators.isObject()
                )(anObject)
                    .should.equal(true);

                const anInt = 2;
                validators.oneOf(
                    validators.isArray(),
                    validators.isObject()
                )(anInt)
                    .should.equal('Was not any of the possible types:\n\nWas not an array!\nWas not an object!');
            });
        });

        describe('require', () => {
            it('must invalidate empty value', () => {
                validators.required(validators.isString)('')
                    .should.equal('A value was required but none was given!');
                validators.required(validators.isObject())({})
                    .should.equal('A value was required but none was given!');
                validators.required(validators.isArray())([])
                    .should.equal('A value was required but none was given!');
            });
        });
    });
});
