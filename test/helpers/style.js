import expect from 'expect';

import {
    error,
    errorLabel,
    warning,
    warningLabel,
    ok,
    okLabel,
    info,
    infoLabel
} from '../../src/helpers/style';
import { makeGetterSpy } from '../utils';

describe('roc', () => {
    describe('helpers', () => {
        describe('style', () => {
            const chalk = require('chalk');

            describe('error', () => {
                let red;
                let bgRed;
                let white;

                beforeEach(() => {
                    red = makeGetterSpy(chalk, 'red');
                    bgRed = makeGetterSpy(chalk, 'bgRed');
                    white = makeGetterSpy(chalk, 'white');
                });

                afterEach(() => {
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
                let yellow, bgYellow, black;

                beforeEach(() => {
                    yellow = makeGetterSpy(chalk, 'yellow');
                    bgYellow = makeGetterSpy(chalk, 'bgYellow');
                    black = makeGetterSpy(chalk, 'black');
                });

                afterEach(() => {
                    yellow.restore();
                    bgYellow.restore();
                    black.restore();
                });

                describe('default', () => {
                    it('should chalk text yellow', () => {
                        const result = warning('test');
                        expect(yellow.called()).toBe(true);
                        expect(result).toInclude('test');
                    });
                });

                describe('label', () => {
                    it('should chalk text black and background yellow', () => {
                        const result = warningLabel('test');
                        expect(black.called()).toBe(true);
                        expect(bgYellow.called()).toBe(true);
                        expect(result).toInclude('test');
                    });
                });
            });

            describe('ok', () => {
                let green, bgGreen, white;

                beforeEach(() => {
                    green = makeGetterSpy(chalk, 'green');
                    bgGreen = makeGetterSpy(chalk, 'bgGreen');
                    white = makeGetterSpy(chalk, 'white');
                });

                afterEach(() => {
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

            describe('info', () => {
                let cyan, bgCyan, black;

                beforeEach(() => {
                    cyan = makeGetterSpy(chalk, 'cyan');
                    bgCyan = makeGetterSpy(chalk, 'bgCyan');
                    black = makeGetterSpy(chalk, 'black');
                });

                afterEach(() => {
                    cyan.restore();
                    bgCyan.restore();
                    black.restore();
                });

                describe('default', () => {
                    it('should chalk text cyan', () => {
                        const result = info('test');
                        expect(cyan.called()).toBe(true);
                        expect(result).toInclude('test');
                    });
                });

                describe('label', () => {
                    it('should chalk text black and background cyan', () => {
                        const result = infoLabel('test');
                        expect(black.called()).toBe(true);
                        expect(bgCyan.called()).toBe(true);
                        expect(result).toInclude('test');
                    });
                });
            });
        });
    });
});
