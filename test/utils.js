import expect from 'expect';

export function consoleMockWrapper(cb) {
    const log = expect.spyOn(console, 'log');
    const error = expect.spyOn(console, 'error');

    const completed = (err) => {
        log.calls = [];
        log.restore();

        error.calls = [];
        error.restore();

        if (err) {
            throw err;
        }
    };

    return Promise.resolve(cb(log, error))
        .then(() => completed())
        .catch(completed);
}
