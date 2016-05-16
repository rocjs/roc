import expect from 'expect';

import automaticConverter from '../../src/converters/automatic';

describe('roc', () => {
    describe('converters', () => {
        describe('automaticConverter', () => {
            it('boolean', () => {
                const converter = automaticConverter(true);

                expect(converter(true)).toBe(true);
                expect(converter(false)).toBe(false);

                expect(converter('true')).toBe(true);
                expect(converter('false')).toBe(false);

                expect(converter('asd')).toBe(undefined);
            });

            describe('array', () => {
                it('integers', () => {
                    const converter = automaticConverter([1, 2, 3]);
                    expect(converter('[1, 2, 3]')).toEqual([1, 2, 3]);
                    expect(converter('1,2,3')).toEqual([1, 2, 3]);
                });

                it('integers', () => {
                    const converter = automaticConverter(['a', 'b', 'c']);
                    expect(converter('["d", "e", "f"]')).toEqual(['d', 'e', 'f']);
                    expect(converter('d,e,f')).toEqual(['d', 'e', 'f']);
                });
            });

            it('regexp', () => {
                const converter = automaticConverter(/asd/);
                expect(converter('/abc/')).toEqual(/abc/);
                expect(converter('efg')).toEqual(/efg/);
            });

            it('number', () => {
                const converter = automaticConverter(1234);
                expect(converter('1234')).toEqual(1234);
            });

            it('object', () => {
                const converter = automaticConverter({});
                expect(converter('{"value": 12}')).toEqual({ value: 12 });
            });

            it('string', () => {
                const converter = automaticConverter('');
                expect(converter('some string')).toEqual('some string');
            });

            it('null', () => {
                const converter = automaticConverter(null);
                const testFunction = () => {};
                expect(converter(testFunction)).toEqual(testFunction);
            });

            it('undefined', () => {
                const converter = automaticConverter(undefined);
                // Define a function to test that it just passes the value through
                const testFunction = () => {};
                expect(converter(testFunction)).toEqual(testFunction);
            });
        });
    });
});
