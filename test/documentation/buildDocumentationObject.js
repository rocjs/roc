import expect from 'expect';

import { validDocumentObject } from './data/documentation-object';
import { config, metaConfig } from './data/configs';
import buildDocumentationObject from '../../src/documentation/buildDocumentationObject';

describe('roc', () => {
    describe('documentation', () => {
        describe('buildDocumentationObject', () => {
            xit('should return a valid object', () => {
                expect(buildDocumentationObject(config, metaConfig))
                    .toEqual(validDocumentObject);
            });
        });
    });
});
