import { join } from 'path';

import managePath from 'manage-path';
import { clone } from 'lodash';

import folderExists from '../../helpers/folderExists';

export default function getEnv(context) {
    const env = clone(process.env);
    if (context) {
        const alterPath = managePath(env);
        const nodeModulesBin = join(context, 'node_modules/.bin');
        if (folderExists(nodeModulesBin)) {
            // We add this first, will make sure we match against what is in our context before "globals"
            alterPath.unshift(nodeModulesBin);
        }
    }

    return env;
}
