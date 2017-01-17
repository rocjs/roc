import initLogLarge from './initLogLarge';
import initLogSmall from './initLogSmall';

module.exports = function initLog(name, version) {
    return {
        large: initLogLarge(name, version),
        small: initLogSmall(),
    };
};
