import large from './large';
import small from './small';

export default function log(name, version) {
    return {
        large: large(name, version),
        small: small()
    };
}
