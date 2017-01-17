import util from 'util';
import { spawnSync } from 'child_process';

/*
 * This is a sync variant of https://github.com/mmalecki/spawn-command
 * We will hopefully be able to replace this with a version from the package above.
 * See https://github.com/mmalecki/spawn-command/issues/6 for more details
 */
export default function spawnCommandSync(command, options) {
    let file;
    let args;

    if (process.platform === 'win32') {
        file = 'cmd.exe';
        args = ['/s', '/c', '"' + command + '"'];
        options = util._extend({}, options); // eslint-disable-line
        options.windowsVerbatimArguments = true; // eslint-disable-line
    } else {
        file = '/bin/sh';
        args = ['-c', command];
    }

    return spawnSync(file, args, options);
}
