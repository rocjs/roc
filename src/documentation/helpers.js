import 'source-map-support/register';

import stripAnsi from 'strip-ansi';
import { isPlainObject, isString } from 'lodash';

export function pad(length, character = ' ') {
    return Array(length + 1).join(character);
}

export function addPadding(string, length) {
    string = string || '';
    return string + pad(length - stripAnsi(string).length);
}

export function toCliFlag(configPaths) {
    // Runtime should be added directly
    if (configPaths[0] === 'runtime') {
        configPaths.shift();
    }
    return '--' + configPaths.join('-');
}

export function getDefaultValue(object) {
    if (Array.isArray(object) && !object.length ||
        isString(object) && !object ||
        isPlainObject(object) && Object.keys(object).length === 0) {
        return null;
    }

    return JSON.stringify(object);
}
