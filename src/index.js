export {
    getConfig,
    appendConfig,
} from './configuration/manageConfig';

export {
    getSettings,
    appendSettings,
} from './configuration/manageSettings';

export merge from './helpers/merge';

export runCli from './cli/runCli';

export execute from './execute';
export executeSync from './execute/executeSync';
export executeSyncExit from './execute/executeSyncExit';

export { getAbsolutePath, fileExists, folderExists, lazyFunctionRequire } from './helpers';

export defaultPrompt from './commands/helpers/defaultPrompt';

export runHook from './hooks/runHook';

export runHookDirectly from './hooks/runHookDirectly';

export {
    removeActions,
} from './hooks/manageActions';

export { getResolveRequest } from './require/manageResolveRequest';

export generateDependencies from './require/utils/generateDependencies';

export initLog from './log';

export initRuntime from './runtime';
