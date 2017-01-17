import leven from 'leven';
import chalk from 'chalk';

/**
 * Will create a string with suggestions for possible typos.
 *
 * @param {string[]} current - The current values that might be incorrect.
 * @param {string[]} possible - All the possible correct values.
 * @param {string} [prefix=''] - Something that the suggestion should be prefixed with. Useful for CLI options.
 *
 * @returns {string} - A string with possible suggestions for typos.
 */
export default function getSuggestions(current, possible, prefix = '') {
    const info = [];

    current.forEach((currentKey) => {
        let shortest = 0;
        let closest;

        // eslint-disable-next-line
        for (const key of possible) {
            const distance = leven(currentKey, key);

            if (distance <= 0 || distance > 4) {
                continue; // eslint-disable-line
            }

            if (shortest && distance >= shortest) {
                continue; // eslint-disable-line
            }

            closest = key;
            shortest = distance;
        }

        if (closest) {
            info.push(`Did not understand ${chalk.underline(prefix + currentKey)}` +
                ` - Did you mean ${chalk.underline(prefix + closest)}`);
        } else {
            info.push(`Did not understand ${chalk.underline(prefix + currentKey)}`);
        }
    });

    return info.join('\n');
}
