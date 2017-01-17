/**
 * Creates mappings between cli commands to their "path" in the configuration structure, their validator and type
 * converter.
 *
 * @param {Object} documentationObject - Documentation object to create mappings for.
 *
 * @returns {Object} - Properties are the cli command without leading dashes that maps to the mapped configuration.
 */
export default function getMappings(documentationObject = []) {
    const recursiveHelper = (groups) => {
        let mappings = {};

        groups.forEach((group) => {
            group.objects.forEach((element) => {
                // Remove the two dashes in the beginning to match correctly
                mappings[element.cli.substr(2)] = {
                    name: element.cli,
                    path: element.path,
                    converter: element.converter,
                    validator: element.validator,
                };
            });

            mappings = Object.assign({}, mappings, recursiveHelper(group.children));
        });

        return mappings;
    };

    return recursiveHelper(documentationObject);
}
