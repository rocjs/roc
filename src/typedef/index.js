/**
 * Validator info object.
 *
 * @typedef {Object} infoObject
 * @property {string} type - The type.
 * @property {boolean} required - If it is required.
 */

/**
 * Validator info object.
 *
 * @typedef {Object} rocCommandObject
 * @property {boolean} debug - If debug mode has been enabled.
 * @property {{version: string, name: string}} info - The object passed to runCli function with version and name.
 * @property {rocConfig} configObject - The final configuration object where everything has been merged.
 * @property {rocMetaConfig} metaObject - The final meta configuration object where everything has been merged.
 * @property {rocConfig} packageConfig - The configuration object where all packages has been merged.
 * @property {rocArguments} parsedArguments - The parsed arguments given to the cli.
 * @property {rocOptions} parsedOptions - The parsed options given to the cli.
 */

/**
 * Roc config object.
 *
 * @typedef {Object} rocConfig
 * @property {rocSettings} settings
 * @property {Object} commands
 * @property {Object} plugins
 * @property {string[]} packages
 */

/**
 * Roc meta config object.
 *
 * @typedef {Object} rocMetaConfig
 * @property {rocMetaSettings} settings
 * @property {Object} commands
 * @property {Object} plugins
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
 * @property {function} convertor
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
