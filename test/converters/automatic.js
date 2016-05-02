import expect from 'expect';

import { consoleMockWrapper } from '../utils';

import automaticConverter from '../../src/converters/automatic';

describe('roc', () => {
    describe('converters', () => {
        describe('automaticConverter', () => {
            it('boolean', () => {
                return consoleMockWrapper((log) => {
                    const converter = automaticConverter(true);

                    expect(converter(true)).toBe(true);
                    expect(converter(false)).toBe(false);

                    expect(converter('true')).toBe(true);
                    expect(converter('false')).toBe(false);

                    expect(converter('asd')).toBe(true);
                    expect(log.calls[0].arguments[0]).toInclude('Invalid value given');
                });
            });

            it('array', () => {
                const converter = automaticConverter([1, 2, 3]);
                expect(converter('[1, 2, 3]')).toEqual([1, 2, 3]);
                expect(converter('1,2,3')).toEqual(['1', '2', '3']);
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
        });
    });
});
