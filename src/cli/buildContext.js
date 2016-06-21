import { isPlainObject, difference, isFunction } from 'lodash';

import log from '../log/default/large';
import merge from '../helpers/merge';
import { OVERRIDE } from '../configuration/addOverrides';
import getApplicationConfig from '../configuration/getApplicationConfig';
import getSuggestions from '../helpers/getSuggestions';
import fileExists from '../helpers/fileExists';
import getRocPackageDependencies from '../helpers/getRocPackageDependencies';
import getRocPluginDependencies from '../helpers/getRocPluginDependencies';
import getPackage from '../helpers/getPackage';
import { registerAction, registerActions } from '../hooks/manageActions';
import { setResolveRequest, getResolveRequest } from '../require/manageResolveRequest';
import patchRequire from '../require/patchRequire';
import verifyInstalledDependencies from '../require/verifyInstalledDependencies';

import buildExtensionTree from './extensions/buildExtensionTree';
import { normalizeCommands } from './extensions/helpers/processCommands';
import { getDefaultConfig, getDefaultMeta, getDefaultCommands } from './getDefaults';

/**
 * Builds the context
 *
 * @param {boolean} [verbose=true] - If verbose mode should be enabled, logs some extra information.
 * @param {rocConfig} baseConfig - The base configuration.
 * @param {rocMetaConfig} baseMeta - The base meta configuration.
 * @param {object} baseCommands - The base commands.
 * @param {string} [directory=process.cwd()] - The directory to resolve relative paths from.
 * @param {string} applicationConfigPath - The path to the application configuration.
 * @param {boolean} [validate=true] - If the newConfig and the newMeta structure should be validated.
 * @param {boolean} [checkDependencies=true] - If dependencies should be verified in extensions.
 *
 * @returns {Object} - The result of with the built configurations.
 * @property {rocConfig} packageConfig - The packages merged configurations.
 * @property {rocConfig} config - The final configuration, with application configuration.
 * @property {rocMetaConfig} meta - The merged meta configuration.
 */
export default async function buildContext(
    verbose = false,
    baseConfig = {},
    baseMeta = {},
    baseCommands = {},
    directory = process.cwd(),
    applicationConfigPath,
    validate = true,
    checkDependencies = true
) {
    let finalConfig = merge(getDefaultConfig(), baseConfig);
    let finalMeta = merge(getDefaultMeta(), baseMeta);
    let finalCommands = normalizeCommands(
        'roc',
        merge(baseCommands, getDefaultCommands(directory))
    );

    let finalDependencies = {};
    let projectConfig = {};
    let finalUsedExtensions;
    let finalProjectExtensions;
    let pkg = {};

    if (fileExists('package.json', directory)) {
        pkg = getPackage(directory);

        const packages = pkg.roc && pkg.roc.packages && pkg.roc.packages.length ?
            pkg.roc.packages :
            getRocPackageDependencies(pkg);

        const plugins = pkg.roc && pkg.roc.plugins && pkg.roc.plugins.length ?
            pkg.roc.plugins :
            getRocPluginDependencies(pkg);

        const {
            usedExtensions,
            projectExtensions,
            config,
            meta,
            dependencies,
            commands
        } = buildExtensionTree(packages, plugins, finalConfig,
            finalMeta, finalCommands, directory, verbose, checkDependencies);

        await verifyProjectDependencies(directory, dependencies.requires);

        finalConfig = merge(finalConfig, config);
        finalMeta = merge(finalMeta, meta);
        finalCommands = merge(finalCommands, commands);
        finalDependencies = dependencies;
        finalUsedExtensions = usedExtensions;
        finalProjectExtensions = projectExtensions;

        setResolveRequest(dependencies.exports, directory);
        initDependencyScope();

        if (projectExtensions.length && verbose) {
            log.info(
                projectExtensions.map(
                    (extn) => `${extn.name}${extn.version ? ' - ' + extn.version : ''}`
                ).join('\n'),
                'Extensions Used'
            );
        }

        projectConfig = getApplicationConfig(applicationConfigPath, directory, verbose);

        // Check for a mismatch between application configuration and packages.
        if (validate) {
            if (Object.keys(projectConfig).length) {
                const validationFeedback = validateConfigurationStructure(finalConfig, projectConfig);
                if (validationFeedback) {
                    // FIXME Revert this to before
                    log.warn(
                        validationFeedback,
                        'Configuration'
                    );
                    console.log(validationFeedback);
                    /* eslint-disable no-process-exit */
                    process.exit(1);
                    /* eslint-enable */
                }
            }
        }

        if (isFunction(projectConfig.actions)) {
            registerAction(projectConfig.actions, 'default', pkg.name, true);
        } else if (isPlainObject(projectConfig.actions)) {
            registerActions(projectConfig.actions, pkg.name, true);
        }
    }

    return {
        commands: finalCommands,
        dependencies: finalDependencies,
        extensionConfig: finalConfig,
        config: merge(finalConfig, projectConfig),
        meta: finalMeta,
        usedExtensions: finalUsedExtensions,
        projectExtensions: finalProjectExtensions,
        pkg
    };
}

async function verifyProjectDependencies(directory, required) {
    const mismatches = await verifyInstalledDependencies(directory, required);
    if (mismatches.length > 0) {
        console.log('Some required dependencies was not found!');
        // TODO Generate a small nice little table!
        mismatches.forEach((mismatch) => {
            console.log(JSON.stringify(mismatch, null, 2));
        });
        /* eslint-disable no-process-exit */
        process.exit(1);
        /* eslint-enable */
    }
}

function initDependencyScope() {
    patchRequire(getResolveRequest('Node'));
}

function validateConfigurationStructure(config, applicationConfig) {
    const getKeys = (obj, oldPath = '', allKeys = []) => {
        Object.keys(obj).forEach((key) => {
            const value = obj[key];
            const newPath = oldPath + key;

            if (isPlainObject(value) && key !== OVERRIDE) {
                getKeys(value, newPath + '.', allKeys);
            } else {
                allKeys.push(newPath);
            }
        });

        return allKeys;
    };
    const keys = getKeys(config);
    const diff = difference(getKeys(applicationConfig), keys);

    if (diff.length > 0) {
        return 'There was a mismatch in the application configuration structure, make sure this is correct.\n' +
            getSuggestions(diff, keys);
    }
}
