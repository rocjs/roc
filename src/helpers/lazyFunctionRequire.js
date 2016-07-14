/*
 * Function that can be used to make require lazy if the default export is a function.
 */
export default function lazyFunctionRequire(fn) {
    return (id) => (...args) => {
        const mod = fn(id);
        return mod.default ? mod.default(...args) : mod(...args);
    };
}
