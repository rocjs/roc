import { isFunction, omit } from 'lodash';

import log from '../log/default/large';
import merge from '../helpers/merge';
import getProjectConfig from '../configuration/getProjectConfig';
import fileExists from '../helpers/fileExists';
import getRocPackageDependencies from '../helpers/getRocPackageDependencies';
import getRocPluginDependencies from '../helpers/getRocPluginDependencies';
import getPackageJSON from '../helpers/getPackageJSON';
import { registerActions } from '../hooks/manageActions';
import { setResolveRequest, getResolveRequest } from '../require/manageResolveRequest';
import patchRequire from '../require/patchRequire';

import verifyConfigurationStructure from './helpers/verifyConfigurationStructure';
import verifyInstalledProjectDependencies from './dependencies/verifyInstalledProjectDependencies';
import verifyRequiredDependencies from './dependencies/verifyRequiredDependencies';
import buildExtensionTree from './extensions/buildExtensionTree';
import getDefaults from './helpers/getDefaults';
import processRocObject, { handleResult } from './extensions/helpers/processRocObject';

import { setActions } from '../hooks/manageActions';
import { setHooks } from '../hooks/manageHooks';

/**
 * Builds the context
 *
 * @param {boolean} [verbose=true] - If verbose mode should be enabled, logs some extra information.
 * @param {rocConfig} baseConfig - The base configuration.
 * @param {rocMetaConfig} baseMeta - The base meta configuration.
 * @param {object} baseCommands - The base commands.
 * @param {string} [directory=process.cwd()] - The directory to resolve relative paths from.
 * @param {string} applicationConfigPath - The path to the application configuration.
 * @param {boolean} [verify=true] - If the newConfig and the newMeta structure should be validated.
 * @param {boolean} [checkDependencies=true] - If dependencies should be verified in extensions.
 *
 * @returns {Object} - The result of with the built configurations.
 * @property {rocConfig} packageConfig - The packages merged configurations.
 * @property {rocConfig} config - The final configuration, with application configuration.
 * @property {rocMetaConfig} meta - The merged meta configuration.
 */
export default function initContext({
    verbose = false,
    commands: baseCommands = {},
    directory = process.cwd(),
    projectConfigPath,
    verify = true,
    runtime = true,
    name = 'roc'
}) {
    let context = {
        actions: [],
        commands: baseCommands,
        config: {},
        dependencies: {
            exports: {},
            uses: {},
            requires: {}
        },
        extensionConfig: {},
        hooks: {},
        meta: {},
        projectExtensions: [],
        packageJSON: {},
        usedExtensions: []
    };

    context = getDefaults(context, name, directory);

    if (fileExists('package.json', directory)) {
        context.packageJSON = getPackageJSON(directory);

        const packages =
            context.packageJSON.roc && context.packageJSON.roc.packages && context.packageJSON.roc.packages.length ?
                context.packageJSON.roc.packages :
                getRocPackageDependencies(context.packageJSON);

        const plugins =
            context.packageJSON.roc && context.packageJSON.roc.plugins && context.packageJSON.roc.plugins.length ?
                context.packageJSON.roc.plugins :
                getRocPluginDependencies(context.packageJSON);

        const {
            context: extensionContext,
            dependencyContext
        } = buildExtensionTree(context, packages, plugins, directory, verbose, verify);

        context = merge(
            context,
            extensionContext
        );

        if (verify) {
            verifyRequiredDependencies(directory, context.dependencies.requires);
            verifyInstalledProjectDependencies(context.packageJSON, context.dependencies.exports);
        }

        if (runtime) {
            setResolveRequest(
                context.dependencies.exports,
                directory,
                dependencyContext
            );

            patchRequire(getResolveRequest('Node'));
        }

        if (context.projectExtensions.length && verbose) {
            log.info(
                context.projectExtensions.map(
                    (extension) => `${extension.name}${extension.version ? ' - ' + extension.version : ''}`
                ).join('\n'),
                'Extensions Used'
            );
        }

        const projectConfig = getProjectConfig(projectConfigPath, directory, verbose);

        // Check for a mismatch between application configuration and extensions.
        if (verify) {
            if (Object.keys(projectConfig).length) {
                verifyConfigurationStructure(context.config, projectConfig);
            }
        }

        // Keep a copy of the configuration before we add the user configuration
        context.extensionConfig = context.config;

        if (projectConfig.init) {
            context = processRocObject(
                handleResult({
                    actions: projectConfig.actions,
                    config: omit(projectConfig, ['actions', 'init'])
                }, projectConfig.init({ verbose, directory, context })),
                { context },
                true,
                false
            );
        } else {
            context.config = merge(
                context.config,
                omit(projectConfig, ['actions', 'init'])
            );

            if (projectConfig.actions) {
                // We allow both a function directly or an array of actions
                const projectActions = isFunction(projectConfig.actions) ?
                    [projectConfig.actions] :
                    projectConfig.actions;

                context.actions =
                    registerActions(
                        projectActions,
                        `Project (${context.packageJSON.name})`,
                        context.actions,
                        true
                    );
            }
        }
    }

    if (runtime) {
        setActions(context.actions);
        setHooks(context.hooks);
    }

    return context;
}
