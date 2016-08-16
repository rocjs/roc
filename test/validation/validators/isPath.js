import expect from 'expect';

import isPath from '../../../src/validation/validators/isPath';
import toString from '../../../src/converters/toString';

describe('validators', () => {
    describe('isPath', () => {
        it('should return info object if requested', () => {
            expect(isPath(null, true))
                .toEqual({
                    type: 'Filepath',
                    required: false,
                    canBeEmpty: true,
                    converter: toString,
                });
        });

        it('should validate a filepath correctly', () => {
            expect(isPath('/some/path'))
                .toBe(true);
        });

        it('should return error if value is not a filepath', () => {
            expect(isPath(1))
                .toInclude('not a filepath');
        });
    });
});
