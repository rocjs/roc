import expect from 'expect';

import { validDocumentObject } from './data/documentation-object';
import { config, metaConfig } from './data/configs';
import buildDocumentationObject from '../../src/documentation/build-documentation-object';

describe('roc', () => {
    describe('documentation', () => {
        describe('buildDocumentationObject', () => {
            it('should return a valid object', () => {
                expect(buildDocumentationObject(config, metaConfig))
                    .toEqual(validDocumentObject);
            });
        });
    });
});
