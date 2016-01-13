# Extensions

Extensions are a really important part of Roc that makes building applications possible. They are responsible for adding different libraries and frameworks to the application. See [Configuration](/docs/config/README.md) for how they will typically configure themselves.

## Structure
Roc expects all extensions to export two properties: `baseConfig` and `metaConfig`. These values will be used to merge configuration to build a final configuration object that Roc can use internally.

Other than this the extensions themselves are quite free to do whatever they want to create what is needed to build an application.
