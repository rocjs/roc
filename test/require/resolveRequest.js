import { join } from 'path';

import expect, { createSpy } from 'expect';

import resolveRequest from '../../src/require/resolveRequest';

describe('roc', () => {
    describe('require', () => {
        describe('resolveRequest', () => {
            // Init resolveRequest
            const resolveSpy = createSpy().andReturn(
                require.resolve(join(__dirname, 'fixtures', 'resolveRequest', 'node_modules', 'd'))
            );

            // This is an object that holds all of the dependencies
            // that the project itself has access to.
            const exports = {
                a: {
                    resolve: undefined,
                    context: join(__dirname, 'fixtures', 'resolveRequest')
                },
                b: {
                    resolve: resolveSpy,
                    context: 'my_context'
                }
            };

            // This is an object that holds all the dependencies for the roc extensions
            const dependencyContext = {
                extensionsDependencies: {},
                pathsToExtensions: {}
            };

            const resolver = resolveRequest(exports, __dirname, dependencyContext)('Test');

            it('should bail out of opt-out character is used', () => {
                expect(resolver('_a', __dirname))
                    .toEqual('a');
            });

            it('should resolve to exported version of dependency', () => {
                expect(require(resolver('a', __dirname)))
                    .toEqual('a');
            });

            it('should resolve to exported version of dependency using custom resolve function', () => {
                expect(require(resolver('b', __dirname)))
                    .toEqual('d');

                expect(resolveSpy.calls[0].arguments).toEqual([
                    'b',
                    __dirname,
                    'my_context'
                ]);
            });

            it('should not rewrite request if not inside project', () => {
                expect(resolver('a', join(__dirname, 'node_modules', 'lodash')))
                    .toEqual('a');
            })
        });
    });
});
