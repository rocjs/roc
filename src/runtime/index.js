import initContext from '../context/initContext';
import validateAndUpdateSettings from '../context/helpers/validateAndUpdateSettings';
import { setConfig } from '../configuration/manageConfig';

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
        validateAndUpdateSettings(context).config
    );
}
