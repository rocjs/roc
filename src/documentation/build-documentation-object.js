import { isPlainObject, isFunction } from 'lodash';

import { toCliOption } from './helpers';
import onProperty from '../helpers/on-property';

const defaultValidation = (input, info) => info ? {type: 'Unknown'} : true;

/**
 * Creates a {@link rocDocumentationObject}.
 *
 * @param {Object} initalObject - The object to create a {@link rocDocumentationObject} of.
 * @param {rocMetaSettings} meta - The meta object to use.
 * @param {string[]} [initalFilter=[]] - The groups that should be used, will default to all groups.
 * @param {number}  [initalLevel=0] - The level that the groups should be based on.
 *
 * @returns {rocDocumentationObject} - The completed documentation object.
 */
export default function buildDocumentationObject(initalObject, meta = {}, initalFilter = [], initalLevel = 0) {
    const allObjects = (object = {}, callback) => {
        return Object.keys(object).map(callback).filter((value) => value !== undefined);
    };

    const manageGroup = (object, name, group = {}, description = {}, validation = {}, parents, level, parentNames) => {
        const groupDescription = isPlainObject(group) ? group._description || undefined : group;
        return {
            name,
            parentNames,
            level,
            description: groupDescription,
            objects: recursiveHelper(object, group, description, validation, [], level + 1, parents,
                parentNames.concat(name), true),
            children: recursiveHelper(object, group, description, validation, [], level + 1, parents,
                parentNames.concat(name))
        };
    };

    const manageLeaf = (object, name, description, validation = defaultValidation, parents) => {
        const { type = 'Unknown', required = false } = isFunction(validation) ?
            validation(null, true) :
            ({type: validation.toString(), req: false });

        return {
            name,
            description,
            type,
            required,
            path: parents.join('.'),
            cli: toCliOption(parents),
            defaultValue: object,
            validator: validation
        };
    };

    function recursiveHelper(object, groups = {}, descriptions = {}, validations = {}, filter = [],
        level = 0, initalParents = [], parentNames = [], leaves = false) {
        return allObjects(object, (key) => {
            // Make sure that we either have no filter or that there is a match
            if (filter.length === 0 || filter.indexOf(key) !== -1) {
                const parents = [].concat(initalParents, key);
                const value = object[key];
                if (isPlainObject(value) && Object.keys(value).length > 0 && !leaves) {
                    const group = isPlainObject(groups) ? groups[key] : {};
                    return manageGroup(value, key, group, descriptions[key], validations[key], parents, level,
                        parentNames);
                } else if ((!isPlainObject(value) || Object.keys(value).length === 0) && leaves) {
                    return manageLeaf(value, key, descriptions[key], validations[key], parents);
                }
            }
        });
    }

    return recursiveHelper(initalObject, meta.groups, meta.descriptions, meta.validations, initalFilter, initalLevel);
}

/**
 * Sort a documentationObject on a specific property.
 *
 * @param {string} property - The property to sort on.
 * @param {rocDocumentationObject} documentationObject - The documentationObject to sort.
 *
 * @returns {rocDocumentationObject} - The sorted documentationObject.
 */
export function sortOnProperty(property, documentationObject = []) {
    documentationObject.sort(onProperty(property));
    return documentationObject.map((group) => {
        return {
            ...group,
            objects: sortOnProperty(property, group.objects),
            children: sortOnProperty(property, group.children)
        };
    });
}
