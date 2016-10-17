import { isPlainObject, isFunction } from 'lodash';

import onProperty from '../helpers/onProperty';
import getUnmanagedObject from '../helpers/getUnmanagedObject';
import automatic from '../converters/automatic';
import { RAW } from '../configuration/addRaw';

import toCliOption from './helpers/toCliOption';

const defaultValidator = (input, info) => (info ? { type: 'Unknown' } : true);

export default function buildDocumentationObject(
    initalObject,
    initalMeta = {},
    initalFilter = [],
    markdown = false,
    initalLevel = 0
) {
    const allObjects = (object = {}, callback) =>
        Object.keys(object).map(callback).filter((value) => value !== undefined);

    const manageGroup = (object, name, meta = {}, parents, level) => {
        const description = markdown ?
            (meta.__meta || {}).markdown || (meta.__meta || {}).description :
            (meta.__meta || {}).description;

        return {
            name,
            level,
            description,
            objects: recursiveHelper(object, meta, [], level + 1, parents, true),
            children: recursiveHelper(object, meta, [], level + 1, parents),
            raw: !!object.__raw,
        };
    };

    const manageLeaf = (object, name, meta = {}, parents) => {
        const description = markdown ?
            meta.markdown || meta.description :
            meta.description;
        const validator = meta.validator || defaultValidator;
        const converterFunction = meta.converter;
        const {
            type = 'Unknown',
            required = false,
            canBeEmpty = true,
            converter,
        } = isFunction(validator) ?
            validator(null, true) :
            { type: validator.toString() };

        const cli = toCliOption(parents);
        return {
            name,
            description,
            type,
            required,
            canBeEmpty,
            cli,
            path: parents.join('.'),
            defaultValue: object,
            validator,
            converter: converterFunction || converter || automatic(object),
            extensions: meta.__extensions,
        };
    };

    function recursiveHelper(object, meta = {}, filter = [], level = 0, initalParents = [], leaves = false) {
        return allObjects(object, (key) => {
            // Make sure that we either have no filter or that there is a match
            if ((filter.length === 0 || filter.indexOf(key) !== -1) && key !== RAW) {
                const parents = [].concat(initalParents, key);
                const value = object[key];
                if (
                    isPlainObject(value) &&
                    Object.keys(value).length > 0 &&
                    !leaves &&
                    getUnmanagedObject(meta[key].validator)
                ) {
                    return manageGroup(value, key, meta[key], parents, level);
                } else if ((
                    !isPlainObject(value) ||
                    Object.keys(value).length === 0 ||
                    !getUnmanagedObject(meta[key].validator)) && leaves
                ) {
                    return manageLeaf(value, key, meta[key], parents);
                }
            }

            return undefined;
        });
    }

    return recursiveHelper(
        initalObject,
        initalMeta,
        initalFilter,
        initalLevel
    );
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
    return documentationObject.map((group) =>
        ({
            ...group,
            objects: sortOnProperty(property, group.objects),
            children: sortOnProperty(property, group.children),
        })
    );
}
