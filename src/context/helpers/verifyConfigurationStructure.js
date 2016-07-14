import { isPlainObject, difference } from 'lodash';

import log from '../../log/default/large';
import { RAW } from '../../configuration/addRaw';
import getSuggestions from '../../helpers/getSuggestions';

export default function verifyConfigurationStructure(config, projectConfig) {
    const getKeys = (obj, oldPath = '', allKeys = [], first = true) => {
        Object.keys(obj).forEach((key) => {
            const value = obj[key];
            const newPath = oldPath + key;

            // We only want to check recursively if the key is settings or we already have
            // called the function recursively once
            if (isPlainObject(value) && key !== RAW && (!first || key === 'settings')) {
                getKeys(value, newPath + '.', allKeys, false);
            } else {
                allKeys.push(newPath);
            }
        });

        return allKeys;
    };
    const keys = getKeys(config);
    const diff = difference(getKeys(projectConfig), keys);

    if (diff.length > 0) {
        log.warn(
            'There was a mismatch in the project configuration structure, make sure this is correct.\n' +
                getSuggestions(diff, keys),
            'Configuration'
        );
    }
}
