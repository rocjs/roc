/**
 * An object that contains everything that makes up a Roc extension.
 *
 * @typedef {Object} rocObject
 * @property {rocConfig} config - Configuration object.
 * @property {rocMetaConfig} meta - Meta configuration object.
 * @property {rocBuildConfig} buildConfig - Function that takes the previous configuration and meta objects and returns
    new ones.
 * @property {Object<rocAction|function>} actions - An object with actions that should connect to the hooks.
 * @property {Object<rocHook>} hooks - An object with hooks that should be registered, name of the key is the name of
    the hook.
 * @property {string[]} packages - The packages that the extensions builds on, should be something that Node can resolve
    with `require`.
 * @property {string[]} plugins - The plugins that the extensions builds on, should be something that Node can resolve
    with `require`.
 */

/**
 * A complete action object in Roc.
 *
 * @typedef {Object} rocAction
 * @property {string} [extension] - For which extension this action should run.
 * @property {string} [hook] - For which hook this action should run.
 * @property {string} [description] -A description on what it does, used for documentation generation and can use
    Markdowns.
 * @property {function} action - The action function that does the actual work, see documentation for more info here.
 */

/**
 * A complete hook object in Roc.
 *
 * @typedef {Object} rocHook
 * @property {boolean} [hasCallback] - If the hook uses a callback to do something with what the action returns.
 * @property {Object} [initialValue] - An initial value used for the hook.
 * @property {function} [returns] - A Roc validation function that should verify the value that the action returns.
 * @property {Object[]} arguments - The arguments that the hook will call the actions with.
 * @property {string} [description] -A description on what it does, used for documentation generation and can use
    Markdowns.
 */

/**
 * Function that returns new configuration and meta configuration.
 *
 * @typedef {function} rocBuildConfig
 * @param {rocConfig} config - Configuration object.
 * @param {rocMetaConfig} meta - Meta configuration object.
 * @returns {{config: rocConfig, meta: rocMetaConfig}} - The new configuration and meta configuration object.
 */

/**
 * Validator info object.
 *
 * @typedef {Object} infoObject
 * @property {string} type - The type.
 * @property {boolean} required - If it is required.
 */

/**
 * Roc command object.
 *
 * @typedef {Object} rocCommandObject
 * @property {boolean} debug - If debug mode has been enabled.
 * @property {{version: string, name: string}} info - The object passed to runCli function with version and name.
 * @property {rocConfig} configObject - The final configuration object where everything has been merged.
 * @property {rocMetaConfig} metaObject - The final meta configuration object where everything has been merged.
 * @property {rocConfig} packageConfig - The configuration object where all packages has been merged.
 * @property {rocArguments} parsedArguments - The parsed arguments given to the cli.
 * @property {rocOptions} parsedOptions - The parsed options given to the cli.
 * @property {Object} hooks - The registered hooks.
 * @property {Object[]} actions - The registered actions.
 */

/**
 * Roc config object.
 *
 * @typedef {Object} rocConfig
 * @property {rocSettings} settings
 * @property {Object} commands
 * @property {string[]} packages
 * @property {function} action
 */

/**
 * Roc meta config object.
 *
 * @typedef {Object} rocMetaConfig
 * @property {rocMetaSettings} settings
 * @property {Object} commands
 */

 /**
  * Roc parsed arguments.
  *
  * @typedef {Object} rocArguments
  * @property {Object} arguments
  * @property {Object} rest
  */

/**
 * Roc parsed options.
 *
 * @typedef {Object} rocOptions
 * @property {Object} options
 * @property {Object} rest
 */

/**
 * Roc map object.
 *
 * @typedef {Object} rocMapObject
 * @property {string} name
 * @property {string} path
 * @property {function} converter
 * @property {function} validator
 */

/**
 * Roc documentation object.
 *
 * @typedef {Object[]} rocDocumentationObject
 */

/**
 * Roc table header object.
 *
 * @typedef {Object} rocTableHeader
 */

/**
 * Roc table settings object.
 *
 * See default configuration below:
 * ```
 * {
 *     groupTitleWrapper: (name) => name,
 *     cellDivider: '|',
 *     rowWrapper: (input) => `|${input}|`,
 *     cellWrapper: (input) => ` ${input} `,
 *     header: true,
 *     compact: false
 * }
 * ```
 *
 * @typedef {Object} rocTableSettings
 */

/**
 * Roc settings object.
 *
 * @typedef {Object} rocSettings
 */

 /**
  * Roc meta settings object.
  *
  * @typedef {Object} rocMetaSettings
  */

/**
 * Roc meta settings object.
 *
 * @typedef {Object} rocMetaSettings
 * @property {Object} descriptions
 * @property {Object} groups
 * @property {Object} validations
 */

/**
 * Roc command meta object.
 *
 * @typedef {Object} rocCommandMeta
 * @property {string} description
 * @property {string} help
 * @property {string} markdown
 * @property {Object[]} options
 * @property {Object[]} arguments
 * @property {boolean|string[]} settings
 */
