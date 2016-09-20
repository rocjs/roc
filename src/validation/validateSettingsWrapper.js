import log from '../log/default/large';

import validateSettings from './validateSettings';

/**
 * Validates the provided configuration object.
 */
export default function validateSettingsWrapper(settings, metaSettings = {}, toValidate = true) {
    try {
        if (toValidate === true) {
            validateSettings(settings, metaSettings);
        } else {
            toValidate.forEach((group) => {
                validateSettings(settings[group], metaSettings && metaSettings[group], false, `settings.${group}`);
            });
        }
    } catch (err) {
        log.error(
            `Configuration was not valid.\n\n${err.message}`,
            'Validation Problem'
        );
    }
}
