import initContext from 'roc-core/lib/context/initContext';
import validateAndUpdateSettings from 'roc-core/lib/context/helpers/validateAndUpdateSettings';
import { setConfig } from 'roc-core/lib/config/manageConfig';

export default function initRuntime({
    verbose = false,
    directory = process.cwd(),
    projectConfigPath,
} = {}) {
    const context = initContext({
        verbose,
        directory,
        projectConfigPath,
    });

    setConfig(
        validateAndUpdateSettings(context).config,
    );
}
