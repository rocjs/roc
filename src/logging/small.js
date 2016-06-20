import chalk from 'chalk';

import { isVerbose } from '../helpers/verbose';

export default function log() {
    return {
        norm: logger('log', 'white'),
        info: logger('info', 'cyan'),
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
        const _log = console[level];

        _log(chalk[color](message));

        if (level === 'error') {
            if (isVerbose()) {
                _log('\n', (error && (isVerbose() ? error.stack : error.message)));
            }

            process.exit(1); // eslint-disable-line
        }
    };
}
