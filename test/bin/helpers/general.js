import expect from 'expect';
import path from 'path';

describe('roc', () => {
    describe('bin', () => {
        describe('helpers', () => {
            describe('general', () => {
                const general = require('../../../src/bin/commands/helpers/general');

                describe('validRocProject', () => {
                    it('should return false if package.json does not exist', () => {
                        const invalidPath = path.join(__dirname, '/invalidpath');
                        const result = general.validRocProject(invalidPath);
                        expect(result).toBe(false);
                    });

                    it('should return false if config and extension is missing', () => {
                        const validPath = path.join(__dirname, '/data/package/invalid');
                        const result = general.validRocProject(validPath);
                        expect(result).toBe(false);
                    });

                    it('should return true if package.json exists with roc config', () => {
                        const validPath = path.join(__dirname, '/data/package/valid-config');
                        const result = general.validRocProject(validPath);
                        expect(result).toBe(true);
                    });

                    it('should return true if package.json exists with roc extension', () => {
                        const validPath = path.join(__dirname, '/data/package/valid');
                        const result = general.validRocProject(validPath);
                        expect(result).toBe(true);
                    });
                });
            });
        });
    });
});
