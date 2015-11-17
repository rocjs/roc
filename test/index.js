import chai from 'chai';
import { validate } from '../src';
import * as testData from './data';

chai.should();

describe('roc-config', () => {
    describe('validate', () => {
        it('must be exposed as function', () => {
            validate.should.be.a('function');
        });

        it('must not throw if no config is provided', () => {
            validate();
        });

        it('must not throw if no metaconfig is provided', () => {
            validate(null);
        });

        it('must throw if any connected validate functions return false', () => {
            (() => validate(testData.flatConfig, testData.flatInvalidMetaConfig)).should.throw(Error);
        });

        it('must throw if any nested and connected validate functions return false', () => {
            (() => validate(testData.nestedConfig, testData.nestedInvalidMetaConfig)).should.throw(Error);
        });

        it('must throw if any connected validate regexes do not match', () => {
            (() => validate(testData.flatConfig, testData.flatRegexInvalidMetaConfig)).should.throw(Error);
        });

        it('must throw if any nested and connected regexes do not match', () => {
            (() => validate(testData.nestedConfig, testData.nestedRegexInvalidMetaConfig)).should.throw(Error);
        });

        it('must not throw if all connected validate functions return true', () => {
            validate(testData.flatConfig, testData.flatValidMetaConfig);
        });

        it('must not throw if all nested and connected validate functions return true', () => {
            validate(testData.nestedConfig, testData.nestedValidMetaConfig);
        });

        it('must not throw if nested and connected validate functions evaluate to true given expected inputs', () => {
            validate(testData.nestedConfig, testData.nestedEvaluateMetaConfig);
        });

        it('must not throw if all connected regexes match', () => {
            validate(testData.flatConfig, testData.flatRegexValidMetaConfig);
        });

        it('must not throw if all nested and connected regexes match', () => {
            validate(testData.nestedConfig, testData.nestedRegexValidMetaConfig);
        });

        it('must throw if validation structure does not match that of configuration', () => {
            (() => validate(testData.flatConfig, testData.flatMismatchMetaConfig)).should.throw(Error);
        });
    });
});
