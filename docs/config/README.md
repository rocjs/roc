# Configuration

**Table of Contents**
* [Configuration in applications](#configuration-in-applications)
* [Configuration in extensions](#configuration-in-extensions)
* [Environment overrides](#environment-overrides)
* [Merge behavior](#merge-behavior)
* [Example](#example)

## Configuration in applications

Roc can be configured to a great extent using the `roc.config.js` file. By default it's assumed that it is located inside the current working directory (from where you run a roc command) but you can override this with the cli. Once imported to your project **the configuration and all its internal states** will persist throughout the process lifetime.

The file should export an object that can contain the following properties:

* [`settings`](/docs/config/settings.md)
* [`commands`](/docs/config/commands.md)
* [`actions`](#)

__Extensions should in practice only define `settings` and `commands` in their configuration__

### Override working directory
```
roc COMMAND --directory path/to/directory
```
You can override the current working directory using the `-d, --directory` option. The path can be either relative to the current working directory or absolute.

### Override configuration file
```
roc COMMAND --config path/to/roc.config.js
```
You can override the current the location and name for the `roc.config.js` file using the `-c, --config` option. The path can be either relative to the current working directory or absolute.

## Configuration in extensions
The section above talked about how configuration files are managed in applications but it holds mostly true for extensions as well. They follow the same structure as `roc.config.js`, but does not define values for `actions`.

They also have the option to export a meta configuration file, a `roc.config.meta.js` file. This file is important to add extra data that is non-existing in the `roc.config.js` file.

### Meta configuration
The meta configuration should mirror the normal configuration file to a large extent. It's expected that it exports an object that can contain the following properties:

* [`settings`](/docs/config/settings.md#meta)
* [`commands`](/docs/config/commands.md#meta)

## Environment overrides
Roc will look for two environment variables `ROC_CONFIG_PATH` and `ROC_CONFIG_SETTINGS`.

### `ROC_CONFIG_PATH`
If a configuration file path is provided by environment variable `ROC_CONFIG_PATH` it will load this instead of a configuration file within the project, without merging the two.

### `ROC_CONFIG_SETTINGS`
Roc will append `ROC_CONFIG_SETTINGS` to the settings the first time someone reads the configuration if it's defined. It should be a stringified object that can be converted with `JSON.parse`.

## Merge behavior
One big part of the configuration management in Roc is how configuration files are merged. Application configurations, and by default in extensions, are deeply merged using [deep-extend](https://www.npmjs.com/package/deep-extend).

This results in that the merge is based on properties and values for those properties. Duplicated properties will overwrite each other. That means for instance that arrays will not be magically merged but rather overwrite the old value. A benefit of this is that it becomes trivial to override something defined in extensions.

## Example

**Get configuration**
```js
import { getConfig } from 'roc';

const config = getConfig();

```

**Extend configuration with custom configuration and use it**
```js
import { appendConfig } from 'roc';

const customConfig = {
    property: 'value'
};

const config = appendConfig(customConfig);
```

**Perform multiple modifications and use**
```js
import { appendConfig, getConfig } from 'roc';

// deep merges parameter to current appended configuration state
appendConfig({
    value: 'value'
});

appendConfig({
    value2: 'value2'
});

// config will hold { "value": "value", "value2": "value2" }
const config = getConfig();
```
