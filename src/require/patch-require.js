const log = require('debug')('roc:require');

const Module = require('module');
const originalRequire = Module.prototype.require;

export default function patchRequire(resolveRequest) {
    log('Initializing');

    Module.prototype.require = function(request) {
        return originalRequire.apply(this, [resolveRequest(request, this.id)]);
    };
}
