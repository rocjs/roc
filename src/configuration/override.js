import { isPlainObject } from 'lodash';

export const OVERRIDE = '__override';

export default function addOverrides(config) {
    const manageSettings = (settingsSlice) => {
        let newSettings = {};
        Object.keys(settingsSlice).forEach((key) => {
            if (isPlainObject(settingsSlice[key])) {
                if (key === OVERRIDE) {
                    newSettings = {
                        ...newSettings,
                        ...settingsSlice[key]
                    };
                } else {
                    newSettings = {
                        ...newSettings,
                        [key]: manageSettings(settingsSlice[key])
                    };
                }
            } else {
                newSettings = {
                    ...newSettings,
                    [key]: settingsSlice[key]
                };
            }
        });
        return newSettings;
    };

    return {
        ...config,
        settings: manageSettings(config.settings)
    };
}
