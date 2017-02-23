export default async function(data, metadata, done) {
    const keys = Object.getOwnPropertyNames(data);

    for (const key of keys) {
        await unwrap(metadata, key, data[key]);
    }

    done();
}

async function unwrap(metadata, key, dataProvider) {
    /* eslint-disable no-param-reassign */
    if (typeof dataProvider === 'function') {
        try {
            metadata[key] = await dataProvider();
        } catch (e) {
            // error in async function, leave this key
        }
        return;
    }
    metadata[key] = dataProvider;
    /* eslint-enable */
}
