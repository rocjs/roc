import expect from 'expect';
import redent from 'redent';
import stripAnsi from 'strip-ansi';

import {
    generateMarkdownDocumentation,
    generateTextDocumentation
} from '../../src/documentation';

describe('roc', () => {
    describe('documentation', () => {
        describe('generateMarkdownDocumentation', () => {
            it('should return emptry string when reciving empty input', () => {
                expect(generateMarkdownDocumentation({
                    settings: {}
                }, {
                    settings: {}
                })).toEqual('');
            });

            it('should return a simple markdown table given input', () => {
                expect(generateMarkdownDocumentation({
                    settings: {
                        runtime: {
                            port: 80,
                            enabled: false
                        }
                    }
                }, {
                    settings: {}
                })).toEqual(
                    redent(`
                        # Runtime

                        | Name    | Description | Path            | CLI Flag  | Default | Type      | Required |
                        | ------- | ----------- | --------------- | --------- | ------- | --------- | -------- |
                        | port    |             | runtime.port    | --port    | \`80\`    | \`Unknown\` | No       |
                        | enabled |             | runtime.enabled | --enabled | \`false\` | \`Unknown\` | No       |
                        `
                    )
                );
            });
        });

        describe('generateTextDocumentation', () => {
            it('should return emptry string when reciving empty input', () => {
                expect(generateTextDocumentation({
                    settings: {}
                }, {
                    settings: {}
                })).toEqual('');
            });

            it('should return a simple markdown table given input', () => {
                const table = generateTextDocumentation({
                    settings: {
                        runtime: {
                            port: 80,
                            on: false
                        }
                    }
                }, {
                    settings: {
                        descriptions: {
                            runtime: {
                                port: 'Some really long description string that is over 100 characters long so we ' +
                                'can test the cut off and make sure dots are added',
                                on: 'Short description'
                            }
                        }
                    }
                });
                /* eslint-disable max-len */
                expect(stripAnsi(table)).toEqual(
                    redent(`
                        runtime

                        | Description                                                                                           | Path         | Default | CLI Flag | Required |
                        | ----------------------------------------------------------------------------------------------------- | ------------ | ------- | -------- | -------- |
                        | Some really long description string that is over 100 characters long so we can test the cut off and … | runtime.port | 80      | --port   | No       |
                        | Short description                                                                                     | runtime.on   | false   | --on     | No       |
                        `
                    )
                );
                /* eslint-enable */
            });
        });
    });
});
