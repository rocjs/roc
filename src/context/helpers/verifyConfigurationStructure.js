import { isPlainObject, difference } from 'lodash';

import log from '../../log/default/large';
import { OVERRIDE } from '../../configuration/addOverrides';
import getSuggestions from '../../helpers/getSuggestions';

export default function verifyConfigurationStructure(config, applicationConfig) {
    const getKeys = (obj, oldPath = '', allKeys = []) => {
        Object.keys(obj).forEach((key) => {
            const value = obj[key];
            const newPath = oldPath + key;

            if (isPlainObject(value) && key !== OVERRIDE) {
                getKeys(value, newPath + '.', allKeys);
            } else {
                allKeys.push(newPath);
            }
        });

        return allKeys;
    };
    const keys = getKeys(config);
    const diff = difference(getKeys(applicationConfig), keys);

    if (diff.length > 0) {
        log.warn(
            'There was a mismatch in the application configuration structure, make sure this is correct.\n' +
                getSuggestions(diff, keys),
            'Configuration'
        );
    }
}
