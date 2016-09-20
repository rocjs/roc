import spawnCommandSync from './helpers/spawnCommandSync';
import getEnv from './helpers/getEnv';
import getCommand from './helpers/getCommand';
import ExecuteError from './helpers/ExecuteError';

export default function executeSync(command, { context, cwd, args, silent } = {}) {
    const cmd = getCommand(command, args);
    const { status, stdout, stderr } = spawnCommandSync(cmd, {
        stdio: silent ? undefined : 'inherit',
        env: getEnv(context),
        cwd,
    });

    if (status) {
        throw new ExecuteError(`The command "${cmd}" failed with error code ${status}`,
            cmd,
            status,
            stderr && stderr.toString(),
            stdout && stdout.toString()
        );
    }

    return stdout && stdout.toString();
}
