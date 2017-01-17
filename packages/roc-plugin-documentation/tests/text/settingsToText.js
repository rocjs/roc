import { join } from 'path';
import expect from 'expect';

import redent from 'redent';
import stripAnsi from 'strip-ansi';
import trimNewlines from 'trim-newlines';

import settingsToText from '../../src/commands/text/settingsToText';
import getContext from '../fixtures/getContext';

describe('documentation', () => {
    describe('text', () => {
        describe('settingsToText', () => {
            it('should return a message when there is no settings', () => {
                expect(settingsToText({}, {}))
                    .toEqual('No settings available.');
            });

            it('should return a correct structured table', () => {
                const context = getContext(join(__dirname, '..', 'fixtures', 'projects', 'complex'));
                expect(stripAnsi(settingsToText(context.extensionConfig, context.meta)))
                    .toEqual(
                        redent(trimNewlines(`
                            group

                            | Description | Path         | Default | CLI option     | Required | Can be empty |
                            | ----------- | ------------ | ------- | -------------- | -------- | ------------ |
                            |             | group.value2 | false   | --group-value2 | No       | Yes          |
                            `,
                        )),
                    );
            });
        });
    });
});
