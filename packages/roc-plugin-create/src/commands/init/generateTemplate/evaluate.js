import log from 'roc-logger/default/small';

/**
 * Evaluate an expression in roc.setup.js(on) in the context of
 * prompt answers data.
 */
export default function evaluate(exp, data) {
  /* eslint-disable no-new-func */
    const fn = new Function('data', `with (data) { return ${exp}}`);
    try {
        return fn(data);
    } catch (e) {
        return log.warn(`Error when evaluating filter condition: ${exp}`);
    }
}
