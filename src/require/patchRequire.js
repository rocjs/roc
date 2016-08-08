const Module = require('module');

const log = require('debug')('roc:core:require');

const originalRequire = Module.prototype.require;

export default function patchRequire(resolveRequest) {
    log('Initializing');

    Module.prototype.require = function rocRequire(request) {
        try {
            return originalRequire.apply(this, [resolveRequest(request, this.id)]);
        } catch (_error) {
            /* We try again with fallback enabled.
             * This emulates kinda how NODE_PATH works in that we try again with another scope.
             * What this does is that it uses the context of dependencies for the extension
             * that a dependency is installed in to manage possible failures. This is needed
             * if a dependency of an extension requires some peerDependency that some other
             * extension is providing.
             */
            return originalRequire.apply(this, [resolveRequest(request, this.id, true)]);
        }
    };
}
