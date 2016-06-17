export {
    merge,
    getConfig,
    appendConfig,
    getSettings,
    appendSettings
} from './configuration';

export { runCli, initCli } from './cli';

export { validate } from './validation';

export { execute, executeSync } from './cli/execute';

export { getAbsolutePath, fileExists } from './helpers';

export { defaultPrompt } from './commands/helpers/default-prompt';

export {
    runHook,
    runHookDirectly,
    registerHooks
} from './hooks';

export {
    registerAction,
    registerActions,
    removeActions
} from './hooks/actions';

export getConfiguration from './cli/get-configuration';

export { getResolveRequest } from './cli/manage-resolve-request';

export generateDependencies from './require/helpers/generate-dependencies';

export generateDocs from './documentation/generate-docs';
