import initContext from '../context/initContext';
import { appendConfig } from '../configuration/manageConfig';
import runHook from '../hooks/runHook';
import { appendSettings } from '../configuration/manageSettings';

export default function initRuntime({
    verbose = false,
    directory = process.cwd(),
    projectConfigPath
}) {
    const { config } = initContext({
        verbose,
        directory,
        projectConfigPath
    });

    runHook('roc')('update-settings', () => context.config.settings)(
        (newSettings) => context.config.settings = appendSettings(newSettings, context.config)
    );

    appendConfig(config);
}
