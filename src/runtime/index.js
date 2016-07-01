import { join } from 'path';

import { isString } from 'lodash';

import initContext from '../context/initContext';
import { appendConfig } from '../configuration/manageConfig';
import runHook from '../hooks/runHook';
import { appendSettings } from '../configuration/manageSettings';

export default function initRuntime(filenameOrOptions, options) {
    const {
        file,
        opts: {
            verbose = false,
            directory = process.cwd(),
            projectConfigPath
        } = {}
    } = isString(filenameOrOptions) ?
        ({ file: filenameOrOptions, opts: options }) :
        ({ opts: filenameOrOptions });

    return initContext({
        verbose,
        directory,
        projectConfigPath
    }).then(({ config }) => {
        runHook('roc')('update-settings', () => context.config.settings)(
            (newSettings) => context.config.settings = appendSettings(newSettings, context.config)
        );

        appendConfig(config);
    }).then(() => {
        // If a filename has been provided we will try to load it
        if (file) {
            require(join(directory, file));
        }
    });
}
