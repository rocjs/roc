import { isBoolean } from 'lodash';
import chalk from 'chalk';
import symbols from 'log-symbols';

import { getContext } from '../context/helpers/manageContext';

export default function initLogSmall() {
    return {
        log: logger('log'),
        info: logger('info', 'cyan', symbols.info),
        warn: logger('warn', 'yellow', symbols.warning),
        error: logger('error', 'red', symbols.error),
        success: logger('log', 'green', symbols.success),
        raw: logger,
    };
}

function logger(level, color, symbol) {
    const validLevels = ['info', 'warn', 'error', 'log'];
    if (validLevels.indexOf(level) === -1) {
        throw new Error(`The provided level "${level}" is not valid, try one of: ${validLevels.join(', ')}`);
    }
    return (...args) => {
        const message = args[0] || '';
        const error = isBoolean(args[1]) ? args[2] : args[1];
        const showSymbol = (isBoolean(args[1]) ? args[1] : args[2]) || true;

        const symbolText = symbol && showSymbol ? `${symbol} ` : '';
        const log = console[level]; // eslint-disable-line

        log(color ? chalk[color](symbolText + message) : symbolText + message);
        printError(error, log);

        if (level === 'error') {
            process.exit(process.exitCode || 1); // eslint-disable-line
        }
    };
}

function printError(error, log) {
    if (error && error.message) {
        // Transform Error: XYZ to XYZ for a nicer error message
        // We will only change the error if it is a generic error
        log(`\n${(getContext().verbose ? error.stack : error.toString().replace(/^Error: /, ''))}`);
    }
}
