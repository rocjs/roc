const Module = require('module');

const log = require('debug')('roc:core:require');

const originalResolveFilename = Module._resolveFilename;

export default function patchResolveFilename(resolveRequest) {
    log('Initializing');

    Module._resolveFilename = function rocResolveFilename(request, parent) {
        try {
            return originalResolveFilename.apply(this, [resolveRequest(request, parent.id), parent]);
        } catch (_error) {
            /* We try again with fallback enabled.
             * This emulates kinda how NODE_PATH works in that we try again with another scope.
             * What this does is that it uses the context of dependencies for the extension
             * that a dependency is installed in to manage possible failures. This is needed
             * if a dependency of an extension requires some peerDependency that some other
             * extension is providing.
             */
            return originalResolveFilename.apply(this, [
                resolveRequest(request, parent.id, { fallback: true }),
                parent,
            ]);
        }
    };
}
