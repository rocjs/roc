# `settings`

## Overview
Defined in the [configuration](/docs/Configuration.md), often referred to as `roc.config.js` in projects, and contains settings defined by the different extensions.

Expects that the first level of properties are groups that are used for [reading settings](#read-settings) and when defining [commands](/docs/Commands.md#meta).

__Example__
```javascript
{
  settings: {
    group1: {
      // …
    },
    group2: {
      // …
    }
  }
}
```

The name of the groups and the values in them is entirely up to the extensions to define and any type of value is allowed.

## Escape hatch
It is possible for extensions to enable an escape hatch for settings that can be used by projects to both avoid validation and define things that has not been mapped to the settings. This is to be used with objects to enable additional properties. All of this functionality is behind the `__raw` property key.

### How to use
```javascript
{
  settings: {
    build: {
      module: {
          timeout: 1000,
          __raw: {}
      }
    }
  }
}
```
By specifying `__raw: {}` above the escape hatch will be enabled. The project can then use it and the extension will get it direct on the normal property.

```javascript
// In the projects roc.config.js
{
  settings: {
    build: {
      module: {
        timeout: 500,
        __raw: {
          polling: true
        }
      }
    }
  }
}
```
```javascript
// Used by the extension

// settings.build.module = { timeout: 1000, polling: true }
module(settings.build.module);
```

Projects can see if something supports `__raw` in the generated documentation.

## Interacting with `settings`

### Read settings
To make it easy to read the settings `roc` exports a function named [`getSettings`](/docs/API.md#getsettings).

This function will return the settings for that group and if no group is given it will return the entire settings object.

```javascript
import { getSettings } from 'roc';

const buildSettings = getSettings('build');
```

### Using in commands
See [commands documentation](/docs/Commands.md#meta).

### Using the environment variable

#### `ROC_CONFIG_SETTINGS`
Roc will append `ROC_CONFIG_SETTINGS` to the settings the first time the configuration is read if it's defined. It should be a stringified JSON object that can be converted with `JSON.parse`.

## Meta
The meta settings, sometimes referred to as `roc.config.meta.js`, is used to add descriptions, validations and converters to the settings as a way to both document them and make interaction with them better.

Almost all of the meta data is optional and is used to enhance the experience.

__Example__
```js
{
  settings: {
    group1: {
      __meta: {
        description: 'Description for 1',
        markdown: 'A __markdown__ description',
        override: true / 'roc-package-web-app-react'
      },
      subgroup: {
        __meta: {
          description: 'Description for subgroup',
          markdown: 'A __markdown__ description for subgroup',
          override: true / 'roc-package-web-app-react'
        },
        property: {
          description: 'Some description',
          validator: isString,
          converter: toString,
          override: true / 'roc-package-web-app-react'
        }
      }
    }
  }
}
```

As can be seen in the example above the Roc settings meta object properties can have 4 properties; `description`, `validator`, `converter`, `override` along with a `__meta` property.

### `__meta`
Used for defining meta data on setting groups.

#### `description`
A description for the group that will be shown when using the command line as well as the markdown documentation if no `markdown` property is defined.

#### `markdown`
A markdown description that will be used when generating documentation, will replace the `description`.

#### `override`
Override is used if meta data is changed for a setting or if a setting has been drastically changed. The value should either be `true` that will override everything or a string that should match one of the extensions that modified the setting before the current extension. It’s recommended that a string is used.

### `description`
A description that will be shown when using the command line and when generation documentation for the settings if no markdown property is defined.

### `markdown`
A markdown description that will be shown when generation documentation for the settings, will override `description`.

### `validator`
A validator function that will be used by the command line to verify the configuration structure and inputs given to it directly.

Roc assumes that the validators used is either a RegExp or a function that will return true if it's valid or false/error string if it's not. The functions can also take an optional second argument. If the second argument is `true` it should return an object with information about what the validator expects for input, the required type you could call it. This information is later used when generating documentation. [For more information about this see here.](/docs/Validators.md#custom-validators)

For convenience several types of validators exists in `roc` that can be imported from `roc/validators`. [For a complete list of them please see here](/docs/Validators.md).

### `converter`
Roc will by default provide an automatic converter that will be based on the default value of the corresponding settings or the validator if possible. In most cases will this be sufficient but in some instances a custom converter might be needed. This custom converter will in most cases get a string as input and be expected to return the correct type.

These converters will be used by the command line to convert inputs given to it directly.

For convenience several types of converters exists in `roc` that can be imported from `roc/converters`. [For a complete list of them please see here.](/docs/Converters.md).

### `override`
Override is used if meta data is changed for a setting or if a setting has been drastically changed. The value should either be `true` that will override everything or a string that should match one of the extensions that modified the setting before the current extension. It’s recommended that a string is used.
