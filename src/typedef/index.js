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
 * @property {rocConfig} configObject - The final configuration object where everything has been merged.
 * @property {rocMetaConfig} metaObject - The final meta configuration object where everything has been merged.
 * @property {rocConfig} extensionConfig - The configuration object where all extensions has been merged.
 * @property {rocOptions} parsedOptions - The parsed options given to the cli.
 */

/**
 * Roc config object.
 *
 * @typedef {Object} rocConfig
 * @property {rocSettings} settings
 * @property {Object} commands
 * @property {Object} plugins
 * @property {string[]} extensions
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
 * @typedef {Object} rocDocumentationObject
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
 * @property {Object} descriptions
 * @property {Object} groups
 * @property {Object} validations
 */
