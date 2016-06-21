import { setDependencies, getDevExports } from '../../../dependencies/manageDependencies';

export default function processDevExports(initialState) {
    initialState.usedExtensions.forEach((name) =>
        getDevExports(name) && setDependencies(name, { exports: getDevExports(name) }));
    return initialState;
}
