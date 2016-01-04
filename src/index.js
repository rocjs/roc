import 'source-map-support/register';

export {
    merge,
    getConfig,
    appendConfig,
    getSettings,
    appendSettings
} from './configuration';

export { generateMarkdownDocumentation, generateTextDocumentation } from './documentation';

export { runCli } from './cli';

export { validate } from './validation';

export { execute } from './cli/execute';

export { getAbsolutePath, fileExists } from './helpers';
