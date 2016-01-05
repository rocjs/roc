import chai from 'chai';
import { merge, appendConfig, getConfig } from '../src/configuration';
import { validateMightThrow } from '../src/validation';
import * as testData from './data';

chai.should();

describe('roc-config', () => {
    describe('merge', () => {
        it('must merge correctly', () => {
            merge({a: 1, b: 2}, {c: 3}).should.deep.equal({
                a: 1,
                b: 2,
                c: 3
            });
        });
    });

    describe('getConfig', () => {
        it('must return correct data', () => {
            const testConfig = { a: 1 };
            appendConfig(testConfig);
            getConfig().should.deep.equal(testConfig);
        });
    });

    describe('validateMightThrow', () => {
        it('must be exposed as function', () => {
            validateMightThrow.should.be.a('function');
        });

        it('must not throw if no config is provided', () => {
            validateMightThrow();
        });

        it('must not throw if no metaconfig is provided', () => {
            validateMightThrow(null);
        });

        it('must throw if any connected validate functions return false', () => {
            (() => validateMightThrow(testData.flatConfig, testData.flatInvalidMetaConfig.validations))
            .should.throw(Error);
        });

        it('must throw if any nested and connected validate functions return false', () => {
            (() => validateMightThrow(testData.nestedConfig, testData.nestedInvalidMetaConfig.validations))
            .should.throw(Error);
        });

        it('must throw if any connected validate regexes do not match', () => {
            (() => validateMightThrow(testData.flatConfig, testData.flatRegexInvalidMetaConfig.validations))
            .should.throw(Error);
        });

        it('must throw if any nested and connected regexes do not match', () => {
            (() => validateMightThrow(
                testData.nestedConfig,
                testData.nestedRegexInvalidMetaConfig.validations)).should.throw(Error);
        });

        it('must not throw if all connected validate functions return true', () => {
            validateMightThrow(testData.flatConfig, testData.flatValidMetaConfig.validations);
        });

        it('must not throw if all nested and connected validate functions return true', () => {
            validateMightThrow(testData.nestedConfig, testData.nestedValidMetaConfig.validations);
        });

        it('must not throw if nested and connected validate functions evaluate to true given expected inputs', () => {
            validateMightThrow(testData.nestedConfig, testData.nestedEvaluateMetaConfig.validations);
        });

        it('must not throw if all connected regexes match', () => {
            validateMightThrow(testData.flatConfig, testData.flatRegexValidMetaConfig.validations);
        });

        it('must not throw if all nested and connected regexes match', () => {
            validateMightThrow(testData.nestedConfig, testData.nestedRegexValidMetaConfig.validations);
        });

        it('must throw if validation structure does not match that of configuration', () => {
            (() =>validateMightThrow(testData.flatConfig, testData.flatMismatchMetaConfig.validations))
            .should.throw(Error);
        });
    });
});
