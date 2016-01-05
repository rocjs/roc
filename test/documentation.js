import chai from 'chai';
import * as validators from '../src/validation/validators';
import buildDocumentationObject from '../src/documentation/build-documentation-object';
import generateTable from '../src/documentation/generate-table';

import { pad, addPadding, toCliFlag } from '../src/documentation/helpers';

chai.should();

describe('roc', () => {
    const validDocumentObject = [{
        name: 'runtime',
        level: 0,
        description: 'Runtime configuration',
        objects: [{
            cli: '--option1',
            defaultValue: 'value1',
            description: 'description1',
            name: 'option1',
            path: 'runtime.option1',
            required: undefined,
            type: 'Unknown',
            validator: (input, info) => info ? {type: 'Unknown'} : input
        }],
        children: []
    }, {
        name: 'dev',
        level: 0,
        description: undefined,
        objects: [{
            cli: '--dev-option2',
            defaultValue: 'value2',
            description: 'description2',
            name: 'option2',
            path: 'dev.option2',
            required: undefined,
            type: 'Unknown',
            validator: (input, info) => info ? {type: 'Unknown'} : input
        }],
        children: []
    }];

    describe('documentation', () => {
        describe('buildDocumentationObject', () => {
            it('must return a valid object', () => {
                const config = {
                    runtime: {
                        option1: 'value1'
                    },
                    dev: {
                        option2: 'value2'
                    }
                };

                const metaConfig = {
                    groups: {
                        runtime: 'Runtime configuration'
                    },
                    descriptions: {
                        runtime: {
                            option1: 'description1'
                        },
                        dev: {
                            option2: 'description2'
                        }
                    },
                    validation: {
                        runtime: {
                            option1: validators.isString
                        },
                        dev: {
                            option2: validators.isString
                        }
                    }
                };

                const result =
                    buildDocumentationObject(config, metaConfig);

                result.length.should.deep.equal(validDocumentObject.length);
            });
        });

        describe('generateTable', () => {
            it('must return a valid table with default settings', () => {
                const header = {
                    name: {
                        name: 'Name'
                    },
                    description: {
                        name: 'Description',
                        renderer: (input) => escape(input)
                    },
                    path: {
                        name: 'Path'
                    },
                    cli: {
                        name: 'CLI Flag'
                    },
                    defaultValue: {
                        name: 'Default'
                    },
                    type: {
                        name: 'Type'
                    },
                    required: {
                        name: 'Required',
                        renderer: (input) => {
                            if (input === true) {
                                return 'Yes';
                            }
                            return 'No';
                        }
                    }
                };

                generateTable(validDocumentObject, header).should.equal(
`
runtime
Runtime configuration

| Name    | Description  | Path            | CLI Flag      | Default | Type    | Required |
| ------- | ------------ | --------------- | ------------- | ------- | ------- | -------- |
| option1 | description1 | runtime.option1 | --option1     | value1  | Unknown | No       |

dev

| Name    | Description  | Path            | CLI Flag      | Default | Type    | Required |
| ------- | ------------ | --------------- | ------------- | ------- | ------- | -------- |
| option2 | description2 | dev.option2     | --dev-option2 | value2  | Unknown | No       |
`
                );
            });
        });

        describe('helpers', () => {
            describe('toCliFlag', () => {
                it('must return a runtime option correct', () => {
                    toCliFlag(['runtime', 'option1']).should.equal('--option1');
                });

                it('must return a "general" option correct', () => {
                    toCliFlag(['build', 'option2']).should.equal('--build-option2');
                });
            });

            describe('pad', () => {
                it('must pad correctly', () => {
                    pad(4, '-').should.equal('----');
                });
            });

            describe('addPadding', () => {
                it('must add correct spacing', () => {
                    addPadding('Hello', 6).should.equal('Hello ');
                });
            });
        });
    });
});
