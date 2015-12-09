import stripAnsi from 'strip-ansi';

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
