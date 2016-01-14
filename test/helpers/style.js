import expect from 'expect';

import {
    error,
    errorLabel,
    warning,
    warningLabel,
    ok,
    okLabel
} from '../../src/helpers/style';
import { makeGetterSpy } from './util';

describe('roc', () => {
    describe('helpers', () => {
        describe('style', () => {
            const chalk = require('chalk');

            describe('error', () => {
                let red, bgRed, white;

                before(() => {
                    red = makeGetterSpy(chalk, 'red');
                    bgRed = makeGetterSpy(chalk, 'bgRed');
                    white = makeGetterSpy(chalk, 'white');
                });

                after(() => {
                    red.restore();
                    bgRed.restore();
                    white.restore();
                });

                describe('default', () => {
                    it('should chalk text red', () => {
                        const result = error('test');
                        expect(red.called()).toBe(true);
                        expect(result).toInclude('test');
                    });
                });

                describe('label', () => {
                    it('should chalk text white and backround red', () => {
                        const result = errorLabel('test');
                        expect(white.called()).toBe(true);
                        expect(bgRed.called()).toBe(true);
                        expect(result).toInclude('test');
                    });
                });
            });

            describe('warning', () => {
                let yellow, bgYellow, white;

                before(() => {
                    yellow = makeGetterSpy(chalk, 'yellow');
                    bgYellow = makeGetterSpy(chalk, 'bgYellow');
                    white = makeGetterSpy(chalk, 'white');
                });

                after(() => {
                    yellow.restore();
                    bgYellow.restore();
                    white.restore();
                });

                describe('default', () => {
                    it('should chalk text yellow', () => {
                        const result = warning('test');
                        expect(yellow.called()).toBe(true);
                        expect(result).toInclude('test');
                    });
                });

                describe('label', () => {
                    it('should chalk text white and background yellow', () => {
                        const result = warningLabel('test');
                        expect(white.called()).toBe(true);
                        expect(bgYellow.called()).toBe(true);
                        expect(result).toInclude('test');
                    });
                });
            });

            describe('ok', () => {
                let green, bgGreen, white;

                before(() => {
                    green = makeGetterSpy(chalk, 'green');
                    bgGreen = makeGetterSpy(chalk, 'bgGreen');
                    white = makeGetterSpy(chalk, 'white');
                });

                after(() => {
                    green.restore();
                    bgGreen.restore();
                    white.restore();
                });

                describe('default', () => {
                    it('should chalk text green', () => {
                        const result = ok('test');
                        expect(green.called()).toBe(true);
                        expect(result).toInclude('test');
                    });
                });

                describe('label', () => {
                    it('should chalk text white and background green', () => {
                        const result = okLabel('test');
                        expect(white.called()).toBe(true);
                        expect(bgGreen.called()).toBe(true);
                        expect(result).toInclude('test');
                    });
                });
            });
        });
    });
});
