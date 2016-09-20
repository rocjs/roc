import { isPlainObject } from 'lodash';

export const RAW = '__raw';

export default function addRaw(config) {
    const manageSettings = (settingsSlice) => {
        let newSettings = {};
        Object.keys(settingsSlice).forEach((key) => {
            if (isPlainObject(settingsSlice[key])) {
                if (key === RAW) {
                    newSettings = {
                        ...newSettings,
                        ...settingsSlice[key],
                    };
                } else {
                    newSettings = {
                        ...newSettings,
                        [key]: manageSettings(settingsSlice[key]),
                    };
                }
            } else {
                newSettings = {
                    ...newSettings,
                    [key]: settingsSlice[key],
                };
            }
        });
        return newSettings;
    };

    return {
        ...config,
        settings: manageSettings(config.settings),
    };
}
