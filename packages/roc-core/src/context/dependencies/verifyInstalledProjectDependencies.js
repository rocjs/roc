import { bold, dim, underline } from 'chalk';
import log from 'roc-logger/default/large';

export default function verifyInstalledProjectDependencies({ dependencies, devDependencies }, exports = {}) {
    const matches = [];
    const allDependencies = {
        ...dependencies,
        ...devDependencies,
    };

    Object.keys(exports).forEach((name) => {
        // If the same dependency is in the project we want to warn the user
        if (allDependencies[name]) {
            matches.push({
                name,
                ...exports[name],
            });
        }
    });

    if (matches.length) {
        log.warn(
`You have some dependencies in your package.json that also have been exported by extensions. This is probably a mistake.

${underline('Roc will prioritize the ones exported by the extensions.')}
You can override this by adding "#" to the start of the require/import in the code, see documentation for more info.

Dependencies that is both exported and in the projects package.json:
${matches.map((match) => `- ${bold(match.name)} ${dim('from')} ` +
    `${bold(match.extension)} ${dim('with version')} ${bold(match.version)}`).join('\n')}`,
            'Dependencies',
        );
    }
}
