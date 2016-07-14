import { green, red } from 'chalk';

import log from '../../log/default/large';
import verifyInstalledDependencies from '../../require/verifyInstalledDependencies';
import generateTable from '../../documentation/generateTable';

export default function verifyRequiredDependencies(directory, required) {
    const mismatches = verifyInstalledDependencies(directory, required);
    if (mismatches.length > 0) {
        const header = {
            name: {
                name: 'Dependency'
            },
            current: {
                name: 'Installed version',
                renderer: (input) => {
                    if (input) {
                        return input;
                    }

                    return red('Not installed');
                }
            },
            requested: {
                name: 'Requested version'
            },
            extension: {
                name: 'Extension',
                renderer: (input) => input.name
            },
            inPackageJson: {
                name: 'In package.json',
                renderer: (input) => {
                    if (input) {
                        return green('Yes') + ` - ${input}`;
                    }

                    return red('No');
                }
            }
        };

        const body = [{
            objects: mismatches,
            name: 'Some required dependencies was not found!',
            level: 0
        }];

        log.error(
            generateTable(body, header),
            'Missing dependencies'
        );
    }
}
