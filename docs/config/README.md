# Configuration

**Table of Contents**
* [Configuration in applications](#configuration-in-applications)
* [Configuration in extensions](#configuration-in-extensions)
* [Merge behavior](#merge-behavior)

## Configuration in applications

Roc can be configured to a great extend using the `roc.config.js` file. By default it's assumed that it is located inside the current working directory (from where you run a roc command) but you can override this with the cli.

The file should export an object that can contain the following properties:

* [`settings`](/docs/config/settings.md)
* [`commands`](/docs/config/commands.md)
* [`plugins`](/docs/config/plugins.md)
* [`extensions`](/docs/config/extensions.md)

### Override working directory
```
roc COMMAND --directory path/to/directory
```
You can override the current working directory using the `-d, --directory` flag. The path can be either relative to the current working directory or absolute.

### Override configuration file
```
roc COMMAND --config path/to/roc.config.js
```
You can override the current the location and name for the `roc.config.js` file using the `-c, --config` flag. The path can be either relative to the current working directory or absolute.

## Configuration in extensions
The section above talked about how configuration files are managed in applications but it holds mostly true for extensions as well. They follow the same structure in `roc.config.js` however they must mainly be managed, meaning they can basically be called anything and be located anywhere.

However they also have the option to export a meta configuration file, a `roc.config.meta.js` file. This file is important to add extra data that is non-existing in the `roc.config.js` file.

### Meta configuration
The meta configuration should mirror the normal configuration file to a large extent. It's expected that it exports an object that can contain the following properties:

* [`settings`](/docs/config/settings.md#meta)
* [`commands`](/docs/config/commands.md#meta)
* [`plugins`](/docs/config/plugins.md#meta)

## Merge behavior
One big part of the configuration management in Roc is how configuration files are merged. Application configurations, and by default in extensions, are deeply merged using [deep-extend](https://www.npmjs.com/package/deep-extend).

This results in that the merge is based on properties and values for those properties. Duplicated properties will overwrite each other. That means for instance that arrays will not be magically merged but rather overwrite the old value. A benefit of this is that it becomes trivial to override something defined in an extension.
