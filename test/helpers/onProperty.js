import expect from 'expect';

import onProperty from '../../src/helpers/onProperty';

describe('helpers', () => {
    describe('onProperty', () => {
        it('should sort object on property', () => {
            const data = [{
                a: 3,
                b: 'e',
                c: 1,
            }, {
                a: 1,
                b: 'e',
                c: 3,
            }];

            expect([...data].sort(onProperty('a')))
                .toEqual([{
                    a: 1,
                    b: 'e',
                    c: 3,
                }, {
                    a: 3,
                    b: 'e',
                    c: 1,
                }]);

            expect([...data].sort(onProperty('b')))
                .toEqual([{
                    a: 3,
                    b: 'e',
                    c: 1,
                }, {
                    a: 1,
                    b: 'e',
                    c: 3,
                }]);

            expect([...data].sort(onProperty('c')))
                .toEqual([{
                    a: 3,
                    b: 'e',
                    c: 1,
                }, {
                    a: 1,
                    b: 'e',
                    c: 3,
                }]);
        });
    });
});
