import expect from 'expect';

import lazyFunctionRequire from '../../src/helpers/lazyFunctionRequire';

describe('helpers', () => {
    describe('lazyFunctionRequire', () => {
        beforeEach(() => {
            global.lazyFunctionRequire = undefined;
        });

        afterEach(() => {
            global.lazyFunctionRequire = undefined;
        });

        it('should manage CommonJS default exports', () => {
            delete require.cache[require.resolve('./fixtures/lazyFunctionRequire/1')];

            const lazyFunction = lazyFunctionRequire(require)('./fixtures/lazyFunctionRequire/1');
            expect(global.lazyFunctionRequire).toBe(undefined);
            expect(lazyFunction(1, 2, 3)).toEqual([1, 2, 3]);
            expect(global.lazyFunctionRequire).toBe(1);
        });

        it('should manage ES module default exports', () => {
            delete require.cache[require.resolve('./fixtures/lazyFunctionRequire/2')];

            const lazyFunction = lazyFunctionRequire(require)('./fixtures/lazyFunctionRequire/2');
            expect(global.lazyFunctionRequire).toBe(undefined);
            expect(lazyFunction(1, 2, 3)).toEqual([1, 2, 3]);
            expect(global.lazyFunctionRequire).toBe(2);
        });
    });
});
