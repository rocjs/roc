/**
 * Can be used to calculate the closest character from a list of possible one for a single character.
 *
 * Assumes that the keyboard that is used is a Qwerty keyboard.
 *
 * Used to guess the correct character for a cli option.
 *
 * @param {string} char - The character to find the closest match for.
 * @param {string[]} possible - The list of possible characters.
 *
 * @returns {string} - The closest match.
 */
export default function keyboardDistance(char, possible) {
    if (char.length > 1) {
        throw new Error('First argument must be a single character.');
    }

    possible = possible || [];
    const qwerty = [
        ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
        ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
        ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
        ['z', 'x', 'c', 'v', 'b', 'n', 'm']
    ];

    const getPosition = (c) => {
        for (const rowIndex in qwerty) {
            for (const columnIndex in qwerty[rowIndex]) {
                if (c.toLowerCase() === qwerty[rowIndex][columnIndex]) {
                    return {
                        row: parseInt(rowIndex, 10) + 1,
                        column: parseInt(columnIndex, 10) + 1
                    };
                }
            }
        }
    };

    const map = possible.map((p) => {
        return Object.assign({}, { name: p }, getPosition(p));
    });

    const getDistance = (a, b) => {
        const minRow = Math.abs(a.row - b.row);
        const minColumn = Math.abs(a.column - b.column);

        return minRow > minColumn ? minRow : minColumn;
    };

    const currentKey = getPosition(char);

    let shortest = -1;
    let closest;

    for (let key of map) {
        const distance = getDistance(currentKey, key);

        if (shortest > -1 && distance >= shortest) {
            continue;
        }

        closest = key;
        shortest = distance;
    }

    return closest.name;
}
