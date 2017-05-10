const Module = require('module');
const path = require('path');

const log = require('debug')('roc:core:require');

const originalResolveFilename = Module._resolveFilename;

export default function patchResolveFilename(resolveRequest) {
    log('Initializing');

    Module._resolveFilename = function rocResolveFilename(request, parent) {
        // Get the context for the request, the directory that the request is coming from.
        // We are using "dirname" here to remove "node_modules" from the path that will be
        // present given how Nodes algorithm works, with the first path being the directory
        // from which the request was performed.
        // Example: [/dir/that/did/the/request/node_modules, /dir/that/did/the/node_modules, ...]
        const context = parent && parent.paths
            ? path.dirname(parent.paths[0])
            : undefined;

        try {
            return originalResolveFilename.apply(this, [
                resolveRequest(request, context),
                parent,
            ]);
        } catch (_error) {
            /* We try again with fallback enabled.
             * This emulates kinda how NODE_PATH works in that we try again with another scope.
             * What this does is that it uses the context of dependencies for the extension
             * that a dependency is installed in to manage possible failures. This is needed
             * if a dependency of an extension requires some peerDependency that some other
             * extension is providing.
             */
            return originalResolveFilename.apply(this, [
                resolveRequest(request, context, { fallback: true }),
                parent,
            ]);
        }
    };
}
