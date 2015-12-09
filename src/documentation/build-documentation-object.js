import { isPlainObject, isString, isFunction } from 'lodash';

import { toCliFlag } from './helpers';

export default function buildDocumentationObject(
    initalObject, initalGroups, initalDescriptions, initalValidations, initalFilter = []
) {
    const allObjects = (object, callback) => {
        return Object.keys(object).map(callback).filter((value) => value !== undefined);
    };

    const getDefaultValue = (object) => {
        if (Array.isArray(object) && !object.length ||
            isString(object) && !object ||
            isPlainObject(object) && Object.keys(object).length === 0) {
            return null;
        }

        return JSON.stringify(object);
    };

    const manageGroup = (object, name, group = {}, description, validation, parents, level) => {
        const groupDescription = isPlainObject(group) ? undefined : group;
        return {
            name,
            level,
            description: groupDescription,
            objects: recursiveHelper(object, group, description, validation, [], parents, level + 1, true),
            children: recursiveHelper(object, group, description, validation, [], parents, level + 1)
        };
    };

    const manageLeaf = (object, name, description, validation = () => ({type: 'Unknown'}), parents) => {
        const { type, required } = isFunction(validation) ?
            validation(null, true) :
            ({type: validation.toString(), req: false });

        return {
            name,
            description,
            type,
            required,
            path: parents.join('.'),
            cli: toCliFlag(parents),
            defaultValue: getDefaultValue(object)
        };
    };

    function recursiveHelper(object, groups = {}, descriptions = {}, validations = {}, filter = [],
        initalParents = [], level = 0, leaves = false) {
        return allObjects(object, (key) => {
            // Make sure that we either have no filter or that there is a match
            if (filter.length === 0 || filter.indexOf(key) !== -1) {
                const parents = [].concat(initalParents, key);
                const value = object[key];
                if (isPlainObject(value) && Object.keys(value).length > 0 && !leaves) {
                    return manageGroup(value, key, groups[key], descriptions[key], validations[key], parents, level);
                } else if ((!isPlainObject(value) || Object.keys(value).length === 0) && leaves) {
                    return manageLeaf(value, key, descriptions[key], validations[key], parents);
                }
            }
        });
    }

    return recursiveHelper(initalObject, initalGroups, initalDescriptions, initalValidations, initalFilter);
}
