import chalk from 'chalk';

import { isVerbose } from '../helpers/manageVerbose';

export default function initLogSmall() {
    return {
        info: logger('log'),
        note: logger('info', 'cyan'),
        warn: logger('warn', 'yellow'),
        error: logger('error', 'red'),
        ok: logger('log', 'green'),
        done: logger('log', 'green'),
        raw: logger
    };
}

function logger(level, color) {
    const validLevels = ['info', 'warn', 'error', 'log'];
    if (validLevels.indexOf(level) === -1) {
        throw new Error(`The provided level "${level}" is not valid, try one of: ${validLevels.join(', ')}`);
    }

    return (message, error) => {
        const log = console[level]; // eslint-disable-line

        log(color ? chalk[color](message) : message);
        printError(error, log);

        if (level === 'error') {
            process.exit(1); // eslint-disable-line
        }
    };
}

function printError(error, log) {
    if (error && error.message) {
        return log('\n' + (isVerbose() ? error.stack : error.message));
    }
}
