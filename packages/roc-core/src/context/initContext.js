import { isFunction, omit } from 'lodash';
import archy from 'archy';
import getPackageJSON from 'roc-utils/lib/getPackageJSON';
import getRocPackageDependencies from 'roc-utils/lib/getRocPackageDependencies';
import getRocPluginDependencies from 'roc-utils/lib/getRocPluginDependencies';
import merge from 'roc-utils/lib/merge';
import log from 'roc-logger/default/large';
import { setContext } from 'roc-context';

import { registerActions } from '../hooks/manageActions';
import { setResolveRequest, getResolveRequest } from '../resolver/manageResolveRequest';
import patchResolveFilename from '../resolver/patchResolveFilename';

import getProjectConfig from './helpers/getProjectConfig';
import buildExtensionTree from './extensions/buildExtensionTree';
import processRocObject, { handleResult } from './extensions/helpers/processRocObject';
import verifyConfigurationStructure from './helpers/verifyConfigurationStructure';
import verifyInstalledProjectDependencies from './dependencies/verifyInstalledProjectDependencies';
import verifyRequiredDependencies from './dependencies/verifyRequiredDependencies';

const version = require('../../package.json').version;

/**
 * Builds the context.
 *
 * Will return the context after completion and set in if "runtime" is defined to true.
 */
export default function initContext({
    defaultPlugins = [],
    directory = process.cwd(),
    info = {},
    projectConfigPath,
    runtime = true,
    verbose = false,
    verify = true,
}) {
    let context = {
        actions: [],
        cli: info,
        commands: {},
        config: {
            settings: {},
            project: {
                actions: undefined,
                init: undefined,
            },
        },
        defaultPlugins: [],
        dependencies: {
            exports: {},
            uses: {},
            requires: {},
        },
        directory,
        extensionConfig: {},
        hooks: {},
        inValidProject: false,
        meta: {},
        packageJSON: {},
        projectExtensions: [],
        usedExtensions: [],
        verbose,
        version,
    };

    const projectPackageJSON = getPackageJSON(directory);
    let packages = [];
    let plugins = [];

    if (projectPackageJSON) {
        context.packageJSON = projectPackageJSON;

        packages =
            context.packageJSON.roc && context.packageJSON.roc.packages ?
                context.packageJSON.roc.packages :
                getRocPackageDependencies(context.packageJSON);

        plugins =
            context.packageJSON.roc && context.packageJSON.roc.plugins ?
                context.packageJSON.roc.plugins :
                getRocPluginDependencies(context.packageJSON);

        // A valid project have a package.json and consists of at least one extension
        if (packages.length > 0 || plugins.length > 0) {
            context.inValidProject = true;
        }
    }

    // Register default plugins and add the roc-core plugin
    defaultPlugins.unshift(require.resolve('../plugin'));
    const {
        context: defaultContext,
        dependencyContext: defaultDependencyContext,
    } = buildExtensionTree(context, [], defaultPlugins, verify);

    context = merge(
        context,
        defaultContext,
    );

    // Reset project extensions
    context.defaultPlugins = context.projectExtensions;
    context.projectExtensions = [];

    if (projectPackageJSON) {
        const {
            context: extensionContext,
            dependencyContext,
        } = buildExtensionTree(context, packages, plugins, verify, defaultDependencyContext);

        context = merge(
            context,
            extensionContext,
        );

        if (verify) {
            verifyRequiredDependencies(directory, context.dependencies.requires);
            verifyInstalledProjectDependencies(context.packageJSON, context.dependencies.exports);
        }

        if (runtime) {
            setResolveRequest(
                context.dependencies.exports,
                directory,
                dependencyContext,
            );

            patchResolveFilename(getResolveRequest('Node'));
        }

        const configPath = projectConfigPath ||
            (context.packageJSON.roc && context.packageJSON.roc.config);

        const projectConfig = getProjectConfig(configPath, directory, verbose);

        // Check for a mismatch between application configuration and extensions.
        if (verify) {
            if (Object.keys(projectConfig).length) {
                verifyConfigurationStructure(context.config, context.meta, projectConfig);
            }
        }

        // Keep a copy of the configuration before we add the user configuration
        context.extensionConfig = context.config;

        const projectSpecific = projectConfig.project || {};

        if (projectSpecific.init) {
            context = processRocObject(
                handleResult({
                    actions: projectSpecific.actions,
                    config: omit(projectConfig, ['project']),
                }, projectSpecific.init({ context })),
                { context },
                false,
                true,
                false,
            ).context;
        } else {
            context.config = merge(
                context.config,
                omit(projectConfig, ['project']),
            );

            if (projectSpecific.actions) {
                // We allow both a function directly or an array of actions
                const projectActions = isFunction(projectSpecific.actions) ?
                    [projectSpecific.actions] :
                    projectSpecific.actions;

                context.actions =
                    registerActions(
                        projectActions,
                        `Project (${context.packageJSON.name})`,
                        context.actions,
                        true,
                    );
            }
        }
    }

    if (context.projectExtensions.length && verbose) {
        log.info(
            context.projectExtensions.map(
                (extension) => `${extension.name}${extension.version ? ` - ${extension.version}` : ''}`,
            ).join('\n'),
            'Extensions Used',
        );

        log.info(
            printTree(context.packageJSON, context.usedExtensions, context.projectExtensions),
            'Extensions Tree',
        );
    }

    if (context.defaultPlugins.length && verbose) {
        log.info(
            context.defaultPlugins.map(
                (extension) => `${extension.name}${extension.version ? ` - ${extension.version}` : ''}`,
            ).join('\n'),
            'Default Plugins',
        );
    }

    function printTree(project, usedExtensions, projectExtensions) {
        const getParents = (extensionName) =>
            usedExtensions
                .find(({ name }) => name === extensionName)
                .parents
                .map(({ name, version: v }) => ({
                    label: `${name}@${v}`,
                    nodes: getParents(name),
                }));

        const tree = projectExtensions.map(({ name, version: v }) => ({
            label: `${name}@${v}`,
            nodes: getParents(name),
        }));

        return archy({
            label: `${project.name}@${project.version}`,
            nodes: tree,
        });
    }

    if (runtime) {
        setContext(context);
    }

    return context;
}
