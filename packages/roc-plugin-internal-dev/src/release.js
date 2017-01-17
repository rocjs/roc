// Based on a release script by Michael Jackson - @mjackson
const resolvePath = require('path').resolve;
const readFileSync = require('fs').readFileSync;

const prompt = require('readline-sync').question;
const executeSyncExit = require('roc-execute').executeSyncExit;

module.exports = (extensions) => (commandObject) => {
    const useAlias = commandObject.options.managed['use-alias'];
    const isNext = commandObject.options.managed.next;

    const firstExtensionPath = extensions[0].path;

    // Will base the version number on the first extension
    const getVersion = () =>
        JSON.parse(readFileSync(resolvePath(firstExtensionPath, 'package.json'))).version;

    // Get the next version, which may be specified as a semver version number or anything `npm version` recognizes.
    // This is a "pre-release" if nextVersion is premajor, preminor, prepatch, or prerelease
    const nextVersion = prompt(`Next version (current version is ${getVersion()})? `);
    const isPrerelease = isNext || nextVersion.substring(0, 3) === 'pre';

    // 0) Clean the project
    executeSyncExit(require('./clean')(extensions));

    // 1) Make sure the build passes
    executeSyncExit(require('./build')(extensions));

    // 2) Make sure the tests pass (Currently only lint)
    if (useAlias) {
        executeSyncExit(require('./lintAlias')(extensions));
    } else {
        executeSyncExit(require('./lint')(extensions));
    }

    // 3) Generate new documentation
    require('./docs')(extensions)().then(() => {
        // 4) Increment the package version in package.json for all projects
        extensions.forEach((extension) =>
                executeSyncExit(`cd ${extension.path} && npm version ${nextVersion} --no-git-tag-version`));

        // 5) Read the version from main package
        const newVersion = getVersion();

        // 6) Create a new commit
        // 7) Create a v* tag that points to that commit
        executeSyncExit(`git add . && git commit -m "Version ${newVersion}" && git tag v${newVersion}`);

        // 8) Push to GitHub master. Do this before we publish in case anyone has pushed to GitHub since we last pulled
        executeSyncExit('git push origin master');

        // 9) Publish to npm. Use the "next" tag for pre-releases, "latest" for all others
        extensions.forEach((extension) =>
                executeSyncExit(`cd ${extension.path} && npm publish --tag ${isPrerelease ? 'next' : 'latest'}`));

        // 10) Push the v* tag to GitHub
        executeSyncExit(`git push -f origin v${newVersion}`);

        // 11) Push the "latest" tag to GitHub
        if (!isPrerelease) {
            executeSyncExit('git tag -f latest');
            executeSyncExit('git push -f origin latest');
        }
    });
};
