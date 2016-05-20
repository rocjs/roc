import temp from 'temp';
import fs from 'fs';
import nodeUnzip from 'unzip';
import path from 'path';

// Automatically track and cleanup files at exit
temp.track();

/**
 * Unpacks the given zip file.
 *
 * @param {string} zipFile - The full path to a local zip file.
 *
 * @returns {Promise} The path to the temporary directory where the unzipped files are located.
 */
export default function unzip(zipFile) {
    if (!zipFile) {
        throw new Error('No zip file was given.');
    }

    return new Promise((resolve, reject) => {
        temp.mkdir('roc', (err, dirPath) => {
            if (err) {
                return reject(err);
            }

            fs.createReadStream(zipFile)
                .pipe(nodeUnzip.Extract({ path: dirPath })) // eslint-disable-line new-cap
                .on('error', reject)
                .on('close', () => {
                    // The template zip is assumed to have a root dir
                    try {
                        fs.readdirSync(dirPath)
                            .forEach((file) => {
                                const rootDir = path.join(dirPath, file);
                                if (fs.statSync(rootDir).isDirectory()) {
                                    return resolve(rootDir);
                                }
                            });
                    } catch (error) {
                        return reject(error);
                    }
                    return resolve(dirPath);
                });
        });
    });
}
