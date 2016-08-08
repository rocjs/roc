import log from '../log/default/large';

import validateSettings from './validateSettings';

/**
 * Validates the provided configuration object.
 *
 * @param {rocSettings} settings - The settings object to validate.
 * @param {rocMetaSettings} metaSettings - The meta settings object that has information about how to validate.
 * @param {array|boolean} toValidate - What groups on settings that should be validated.
 * @emits {process.exit} - If the config was invalid it will print the reason and terminate with status 1.
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
