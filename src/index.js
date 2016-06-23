export {
    getConfig,
    appendConfig
} from './configuration/manageConfig';

export {
    getSettings,
    appendSettings
} from './configuration/manageSettings';

export merge from './helpers/merge';

export runCli from './cli/runCli';
export initCli from './cli/initCli';

export validateSettings from './validation/validateSettingsWrapper';

export execute from './execute';
export executeSync from './execute/executeSync';
export executeSyncExit from './execute/executeSyncExit';

export { getAbsolutePath, fileExists } from './helpers';

export { defaultPrompt } from './commands/helpers/defaultPrompt';

export { registerHooks } from './hooks/manageHooks';

export runHook from './hooks/runHook';

export runHookDirectly from './hooks/runHookDirectly';

export {
    registerAction,
    registerActions,
    removeActions
} from './hooks/manageActions';

export getContext from './context/getContext';

export { getResolveRequest } from './require/manageResolveRequest';

export generateDependencies from './require/utils/createDependencies';

export generateDocs from './documentation/markdown/generateDocumentation';

export initLog from './log';

export initRuntime from './runtime';
