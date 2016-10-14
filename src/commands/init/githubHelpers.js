import got from 'got';

export function getOfficialTemplates() {
    return got('https://api.github.com/users/rocjs/repos', {
        json: true,
    })
    .then(response => response.body)
    .then(repos => repos.filter(({ name }) => name.indexOf('roc-template') !== -1));
}

/**
 * Fetches an array of all the tags for a GitHub repo, used as possible versions for a template.
 *
 * @param {string} packageName - A package name, expected to match "username/repo"
 *
 * @returns {object[]} - Array of tags/versions for the package
 */
export function getVersions(packageName) {
    if (!packageName) {
        throw new Error('No packageName was given.');
    }

    return got(`https://api.github.com/repos/${packageName}/tags`, {
        json: true,
    })
    .then(response => response.body);
}
