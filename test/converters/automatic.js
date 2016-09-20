import expect from 'expect';

import automatic from '../../src/converters/automatic';

describe('converters', () => {
    describe('automatic', () => {
        it('boolean', () => {
            const converter = automatic(true);

            expect(converter(true)).toBe(true);
            expect(converter(false)).toBe(false);

            expect(converter('true')).toBe(true);
            expect(converter('false')).toBe(false);

            expect(converter('True')).toBe(undefined);
            expect(converter('False')).toBe(undefined);

            expect(converter('asd')).toBe(undefined);
        });

        describe('array', () => {
            it('integers', () => {
                const converter = automatic([1, 2, 3]);
                expect(converter('[1, 2, 3]')).toEqual([1, 2, 3]);
                expect(converter('1,2,3')).toEqual([1, 2, 3]);
            });

            it('strings', () => {
                const converter = automatic(['a', 'b', 'c']);
                expect(converter('["d", "e", "f"]')).toEqual(['d', 'e', 'f']);
                expect(converter('d,e,f')).toEqual(['d', 'e', 'f']);
            });
        });

        it('regexp', () => {
            const converter = automatic(/asd/);
            expect(converter('/abc/')).toEqual(/abc/);
            expect(converter('efg')).toEqual(/efg/);
        });

        it('integer', () => {
            const converter = automatic(1234);
            expect(converter('1234')).toEqual(1234);
        });

        it('object', () => {
            const converter = automatic({});
            expect(converter('{"value": 12}')).toEqual({ value: 12 });
        });

        it('string', () => {
            const converter = automatic('');
            expect(converter('some string')).toEqual('some string');
        });

        it('null', () => {
            const converter = automatic(null);
            const testFunction = () => {};
            expect(converter(testFunction)).toEqual(testFunction);
        });

        it('undefined', () => {
            const converter = automatic(undefined);
            // Define a function to test that it just passes the value through
            const testFunction = () => {};
            expect(converter(testFunction)).toEqual(testFunction);
        });
    });
});
