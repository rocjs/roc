import { underline } from 'chalk';

import log from '../log/default/large';

export default function verifyDependencies({ dependencies, devDependencies }, exports) {
    const matches = [];
    const allDependencies = {
        ...dependencies,
        ...devDependencies
    };

    Object.keys(exports).forEach((name) => {
        // If the same dependency is in the project we want to warn the user
        if (allDependencies[name]) {
            matches.push(name);
        }
    });

    if (matches.length) {
        log.warn(
`You have some dependencies in your package.json that also have been exported by extensions. This is probably a mistake.

${underline('Roc will prioritize the ones exported by the extensions.')}
You can override this by adding "¡" to the start of the require/import in the code, see documentation for more info.

Dependencies that is both exported and in the projects package.json:
${matches.map((match) => `- ${match}`).join('\n')}`,
            'Dependencies'
        );
    }
}
