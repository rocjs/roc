import initContext from '../context/initContext';
import { appendConfig } from '../configuration/manageConfig';

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

    appendConfig(config);
}
