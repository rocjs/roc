import expect from 'expect';
import redent from 'redent';
import trimNewlines from 'trim-newlines';

import { validDocumentObject } from './data/documentation-object';
import generateTable from '../../src/documentation/generate-table';

describe('roc', () => {
    describe('documentation', () => {
        describe('generateTable', () => {
            it('should return a valid table with default settings', () => {
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
                        name: 'CLI Option'
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

                expect(generateTable(validDocumentObject, header))
                    .toEqual(
                        redent(trimNewlines(`
                            runtime
                            Runtime configuration

                            | Name    | Description  | Path            | CLI Option    | Default | Type   | Required |
                            | ------- | ------------ | --------------- | ------------- | ------- | ------ | -------- |
                            | option1 | description1 | runtime.option1 | --option1     | value1  | String | No       |

                            dev

                            | Name    | Description  | Path            | CLI Option    | Default | Type   | Required |
                            | ------- | ------------ | --------------- | ------------- | ------- | ------ | -------- |
                            | option2 | description2 | dev.option2     | --dev-option2 |         | String | Yes      |
                            `
                        ))
                    );
            });
        });
    });
});
