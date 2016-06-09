import { bold, underline } from 'chalk';
import { isPlainObject, intersection, get, update } from 'lodash';
import { OVERRIDE } from '../../configuration/override';

export default function manageConfig(name, extension, state) {
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

function getKeys(obj = {}, flag = false, oldPath = '', allKeys = [], allGroups = []) {
    let isValue = true;
    Object.keys(obj).forEach((key) => {
        const value = obj[key];
        const newPath = oldPath + key;

        if (isPlainObject(value) && key !== OVERRIDE) {
            isValue = true;
            if (newPath !== 'settings') {
                allGroups.push(true);
                allKeys.push(newPath);
            }
            const x = getKeys(value, flag, newPath + '.', allKeys, allGroups);
            // If nothing was changed we where in a value, not a group
            if (x.value) {
                allGroups[allGroups.length - 1] = false;
            }
        } else if (flag) {
            allKeys.push(newPath);
            allGroups.push(false);
        }
    });

    return {
        paths: allKeys,
        groups: allGroups,
        value: isValue
    };
}

function getGroup(obj, path) {
    return !!obj.groups[obj.paths.indexOf(path)];
}

function notInExtensions(extensions, extension) {
    return extensions.indexOf(extension) === -1;
}

function validateMetaStructure(name, intersections, extensionMeta, stateMeta) {
    intersections.forEach((intersect) => {
        const extensions = get(stateMeta, intersect).__extensions || [];
        const override = (get(extensionMeta, intersect) || {}).override;

        if (
            notInExtensions(extensions, name) &&
            override !== true &&
            notInExtensions(extensions, override)
        ) {
            // Fail early, might be more errors after this
            const overrideMessage = !override ?
                `No override value was specified, it should probably be one of: ${extensions}\n` :
                `The override did not match the possible values, it was: ${override}\n`;
            throw new Error(
                'Meta structure was changed without specifying override.\n' +
                `Meta for ${bold(intersect)} was changed in ${name} that has been altered before by ${extensions}.\n` +
                overrideMessage +
                `Contact the developer of ${underline(name)} for help.`
            );
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
            const override = get(extensionMeta, intersect, {}).override;

            if (
                notInExtensions(extensions, name) &&
                override !== true &&
                notInExtensions(extensions, override)
            ) {
                // Fail early, might be more errors after this
                throw new Error(
                    'Configuration structure was changed without specifying override in meta.\n' +
                    `Was ${wasGroup ? 'a object' : 'an value'} and is now ${isGroup ? 'a object' : 'and value'}.\n` +
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
                __extensions: [
                    ...newExtensions,
                    name
                ]
            };
        });
    });

    return newState;
}
