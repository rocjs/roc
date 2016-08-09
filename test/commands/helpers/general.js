import expect from 'expect';
import path from 'path';

describe('roc', () => {
    describe('commands', () => {
        describe('helpers', () => {
            describe('general', () => {
                //const general = require('../../../src/commands/helpers/general');

                xdescribe('validRocProject', () => {
                    it('should return false if package.json does not exist', () => {
                        const invalidPath = path.join(__dirname, '/invalidpath');
                        const result = general.validRocProject(invalidPath);
                        expect(result).toBe(false);
                    });

                    it('should return false if config and package is missing', () => {
                        const validPath = path.join(__dirname, '/data/package/invalid');
                        const result = general.validRocProject(validPath);
                        expect(result).toBe(false);
                    });

                    it('should return true if package.json exists with roc config', () => {
                        const validPath = path.join(__dirname, '/data/package/valid-config');
                        const result = general.validRocProject(validPath);
                        expect(result).toBe(true);
                    });

                    it('should return true if package.json exists with roc package', () => {
                        const validPath = path.join(__dirname, '/data/package/valid');
                        const result = general.validRocProject(validPath);
                        expect(result).toBe(true);
                    });
                });
            });
        });
    });
});
