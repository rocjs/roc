import initLogLarge from './initLogLarge';
import initLogSmall from './initLogSmall';

export default function initLog(name, version) {
    return {
        large: initLogLarge(name, version),
        small: initLogSmall(),
    };
}
