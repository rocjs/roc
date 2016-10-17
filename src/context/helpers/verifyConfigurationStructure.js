import { isPlainObject, difference, get } from 'lodash';

import { RAW } from '../../configuration/addRaw';
import getSuggestions from '../../helpers/getSuggestions';
import getUnmanagedObject from '../../helpers/getUnmanagedObject';
import log from '../../log/default/large';

export default function verifyConfigurationStructure(config, meta, projectConfig) {
    const getKeys = (obj, oldPath = '', allKeys = [], first = true) => {
        Object.keys(obj).forEach((key) => {
            const value = obj[key];
            const newPath = oldPath + key;

            // We only want to check recursively if the key is settings or we already have
            // called the function recursively once
            const { validator } = get(meta, newPath, {});

            if (
                isPlainObject(value) &&
                key !== RAW &&
                (!first || key === 'settings') &&
                getUnmanagedObject(validator)
            ) {
                getKeys(value, `${newPath}.`, allKeys, false);
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
            `There was a mismatch in the project configuration structure, make sure this is correct.\n${
                getSuggestions(diff, keys)}`,
            'Configuration'
        );
    }
}
