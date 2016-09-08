import match from 'micromatch';

import evaluate from './evaluate';

export default function filter(files, filters, data, done) {
    if (!filters) {
        return done();
    }

    const fileNames = Object.keys(files);
    Object.keys(filters).forEach((glob) => {
        fileNames.forEach((file) => {
            if (match.isMatch(file, glob, { dot: true })) {
                const condition = filters[glob];
                if (!evaluate(condition, data)) {
                    delete files[file]; // eslint-disable-line
                }
            }
        });
    });

    return done();
}
