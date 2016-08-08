import { bold, underline } from 'chalk';
import { isPlainObject, intersection, get, update, union } from 'lodash';

import { RAW } from '../../../configuration/addRaw';

import buildList from './buildList';

export default function processConfig(name, extension, state) {
    const extensionConfigPaths = getKeys(extension.config, true);
    const extensionMetaPaths = getKeys(extension.meta);
    const stateConfigPaths = getKeys(state.config, true);
    const stateMetaPaths = getKeys(state.meta);

    validateMetaStructure(
        name,
        intersection(
            extensionMetaPaths.paths,
            stateMetaPaths.paths
        ),
        stateConfigPaths,
        extension.meta,
        state.meta
    );

    validateConfigurationStructure(
        name,
        intersection(
            extensionConfigPaths.paths,
            stateConfigPaths.paths
        ),
        extensionConfigPaths,
        stateConfigPaths,
        extension.meta,
        state.meta
    );

    return updateStateMeta(
        name,
        state,
        extensionConfigPaths,
        stateConfigPaths
    );
}

/* eslint-disable no-param-reassign */
function getKeys(obj = {}, flag = false, oldPath = '', allKeys = [], allGroups = []) {
    let isValue = true;
    Object.keys(obj).forEach((key) => {
        const value = obj[key];
        const newPath = oldPath + key;

        if (isPlainObject(value) && key !== RAW && key !== '__meta') {
            isValue = true;
            if (newPath !== 'settings') {
                allGroups.push(true);
                allKeys.push(newPath);
            }
            const x = getKeys(value, flag, `${newPath}.`, allKeys, allGroups);
            // If nothing was changed we where in a value, not a group
            if (x.value) {
                allGroups[allGroups.length - 1] = false;
            }
        } else if (flag && key !== '__meta') {
            allKeys.push(newPath);
            allGroups.push(false);
        }
    });

    return {
        paths: allKeys,
        groups: allGroups,
        value: isValue,
    };
}
/* eslint-enable */

function getGroup(obj, path) {
    return !!obj.groups[obj.paths.indexOf(path)];
}

function notInExtensions(extensions, extension) {
    return extensions.indexOf(extension) === -1;
}

function validateMetaStructure(
    name, intersections, stateConfigPaths, extensionMeta, stateMeta
) {
    intersections.forEach((intersect) => {
        const wasGroup = getGroup(stateConfigPaths, intersect);

        if (!wasGroup || get(extensionMeta, `${intersect}.__meta`)) {
            const extensions = get(stateMeta, intersect).__extensions || [];

            // If it is a group the override info will be on __meta and if not it will be directly on the object
            const override = (get(extensionMeta, intersect, {}).__meta || {}).override ||
                get(extensionMeta, intersect, {}).override;

            if (
                notInExtensions(extensions, name) &&
                override !== true &&
                notInExtensions(extensions, override)
            ) {
                // Fail early, might be more errors after this
                const overrideMessage = !override ?
                    'No override value was specified, it should probably be one of the extensions above.' :
                    `The override did not match the possible values, it was: ${override}\n`;
                throw new Error(
                    'Meta structure was changed without specifying override.\n' + // eslint-disable-line
                    `Meta for ${bold(intersect)} was changed in ${name} and has been altered before by:\n` +
                    buildList(extensions) +
                    overrideMessage +
                    `Contact the developer of ${underline(name)} for help.`
                );
            }
        }
    });
}

function validateConfigurationStructure(
    name, intersections, extensionConfigPaths, stateConfigPaths, extensionMeta, stateMeta
) {
    intersections.forEach((intersect) => {
        const wasGroup = getGroup(stateConfigPaths, intersect);
        const isGroup = getGroup(extensionConfigPaths, intersect);
        if (wasGroup !== isGroup) {
            const extensions = get(stateMeta, intersect).__extensions || [];
            // If it is a group the override info will be on __meta and if not it will be directly on the object
            const override = (get(extensionMeta, intersect, {}).__meta || {}).override ||
                get(extensionMeta, intersect, {}).override;

            if (
                notInExtensions(extensions, name) &&
                override !== true &&
                notInExtensions(extensions, override)
            ) {
                // Fail early, might be more errors after this
                throw new Error(
                    'Configuration structure was changed without specifying override in meta.\n' +
                    `Was ${wasGroup ? 'a object' : 'an value'} and is now ${isGroup ? 'a object' : 'an value'}.\n` +
                    `The setting is question is: ${bold(intersect)}\n` +
                    `Contact the developer of ${underline(name)} for help.`
                );
            }
        }
    });
}

function updateStateMeta(name, state, extensionConfigPaths, stateConfigPaths) {
    const newState = { ...state };
    extensionConfigPaths.paths.forEach((path, index) => {
        const changed = getGroup(stateConfigPaths, path) !== extensionConfigPaths.groups[index];
        update(newState.meta, path, (previous = {}) => {
            // If it has changed we will reset it
            const newValue = changed ?
                {} :
                previous;
            const newExtensions = changed ?
                [] :
                previous.__extensions || [];

            return {
                ...newValue,
                __extensions: union(newExtensions, [name]),
            };
        });
    });

    return newState.meta;
}
