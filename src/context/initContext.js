import { isFunction, omit } from 'lodash';
import { yellow, bold } from 'chalk';

import { registerActions } from '../hooks/manageActions';
import { setResolveRequest, getResolveRequest } from '../require/manageResolveRequest';
import fileExists from '../helpers/fileExists';
import getPackageJSON from '../helpers/getPackageJSON';
import getProjectConfig from '../configuration/getProjectConfig';
import getRocPackageDependencies from '../helpers/getRocPackageDependencies';
import getRocPluginDependencies from '../helpers/getRocPluginDependencies';
import log from '../log/default/large';
import merge from '../helpers/merge';
import patchResolveFilename from '../require/patchResolveFilename';

import { setContext } from './helpers/manageContext';
import buildExtensionTree from './extensions/buildExtensionTree';
import getDefaults from './helpers/getDefaults';
import processRocObject, { handleResult } from './extensions/helpers/processRocObject';
import verifyConfigurationStructure from './helpers/verifyConfigurationStructure';
import verifyInstalledProjectDependencies from './dependencies/verifyInstalledProjectDependencies';
import verifyRequiredDependencies from './dependencies/verifyRequiredDependencies';
import getAlphaExtensionsThatAreNotLocked from './dependencies/getAlphaExtensionsThatAreNotLocked';

/**
 * Builds the context.
 *
 * Will return the context after completion and set in if "runtime" is defined to true.
 */
export default function initContext({
    verbose = false,
    commands: baseCommands = {},
    directory = process.cwd(),
    projectConfigPath,
    verify = true,
    runtime = true,
    name = 'roc',
}) {
    let context = {
        actions: [],
        commands: baseCommands,
        config: {},
        dependencies: {
            exports: {},
            uses: {},
            requires: {},
        },
        directory,
        extensionConfig: {},
        hooks: {},
        meta: {},
        projectExtensions: [],
        packageJSON: {},
        usedExtensions: [],
        verbose,
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
            dependencyContext,
        } = buildExtensionTree(context, packages, plugins, verify);

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

            patchResolveFilename(getResolveRequest('Node'));
        }

        if (context.projectExtensions.length && verbose) {
            log.info(
                context.projectExtensions.map(
                    (extension) => `${extension.name}${extension.version ? ` - ${extension.version}` : ''}`
                ).join('\n'),
                'Extensions Used'
            );
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
                false
            ).context;
        } else {
            context.config = merge(
                context.config,
                omit(projectConfig, ['project'])
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
                        true
                    );
            }
        }

        /**
            Temporary warning to manage projects using rc.10
            and extensions with alpha version
        */
        if (getAlphaExtensionsThatAreNotLocked(context.packageJSON)) {
            console.log(`
${yellow('================================================ IMPORTANT ================================================')}
  Roc is getting closer to the first stable 1.0 release and some things have have changed.

  You might be seeing some some warning now about "configuration mismatches" among other things.
  Most of these warning are easy to address and for the full changes please take a look at the
  link below. It also contains information about how to update the project to the latest version.

  https://gist.github.com/dlmr/4a548f85b57c1291d63191aecd30caf6

  To remove this warning please update your Roc dependencies to point to at least "beta.1",
  and preferably lock the versions since we might do more changes in the future that can be breaking.

  If you do not feel like doing this right now you can run the ${bold('"roc lock"')} command that will lock
  the project dependencies to work as before. If you use this we do encourage you to update
  eventually to get all the new improvements.

  We promise to keep breaking changes to a minimum and we are really close to release
  everything as stable.

  If something does not work as expected anymore do not hesitate to post an issue at
  https://github.com/rocjs/roc
${yellow('===========================================================================================================')}
`);
        }
    }

    if (runtime) {
        setContext(context);
    }

    return context;
}
