export default class ExecuteError extends Error {
    constructor(message, command, exitCode, stderr, stdout) {
        super(message);
        this.command = command;
        this.exitCode = exitCode;
        this.stderr = stderr;
        this.stdout = stdout;
    }

    getExitCode() {
        return this.exitCode;
    }

    getCommand() {
        return this.command;
    }

    getStderr() {
        return this.stderr;
    }

    getStdout() {
        return this.stdout;
    }
}
