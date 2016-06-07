# `settings`

**Table of Contents**
* [Overview](#overview)
* [Interacting with `settings`](#interacting-with-settings)
* [Meta](#meta)

## Overview

Defined in the [Roc configuration object](/docs/config/README.md), often referred to as `roc.config.js`, and contains settings defined by the the different extensions.

Expects that the first level of properties are setting groups that are used for [reading settings](#read-settings) and when defining [commands](/docs/config/commands.md#meta). See example below for a valid structure.

```js
module.exports = {
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

The name of the groups and the values in them is entirely up to the extensions to define.

## Interacting with `settings`

### Read settings
To make it easy to read the settings `roc` exports a function named `getSettings(?group)`. This function will return the settings for that group and if no group is given it will return the entire settings object.

### Using in commands
See [commands documentation](/docs/config/commands.md#meta).

## Meta
The meta settings, often referred to as `roc.config.meta.js` are used to add **descriptions**, **validations** and **converters** to the settings as a way to both document them and make interaction with them better. See example below for a valid structure.

```js
// roc.config.meta.js
module.exports = {
    settings: {
        group1: {
            __description: 'Description for 1',
            subgroup: {
                __description: 'Description for subgroup'
                property: {
                    description: 'Some description',
                    validator: isString,
                    converter: toString
                }
            }
        }
    }
}
```

As can be seen in the example above the Roc settings meta object properties can have 3 properties; `description`, `validator` and `converter`.

### `description`
These descriptions will be shown when using the cli and when generation documentation for the settings.

See [roc.config.meta.js in roc-web for an example of how the configuration might look](https://github.com/vgno/roc-web/blob/master/src/roc/config/roc.config.meta.js#L11).

### `validator`
These validations will be used by the cli to verify the configuration structure and inputs given to the cli directly.

Roc assumes that the validators used is either a RegExp or a function that will return true if it's valid or false/error string if it's not. The functions can also take a optional second argument. If it is true it should return a string with information about what the validator expects for input, the required type you could call it. This information is later used when generating documentation.

For convenience several types of validators exists in `roc` that can be imported from `roc/validators`. For a complete list of them please see [the JSDocs](/docs/JSDocs.md).

See [roc.config.meta.js in roc-web for an example of how the configuration might look](https://github.com/vgno/roc-web/blob/master/src/roc/config/roc.config.meta.js#L62).

### `converter`
Roc will by default provide an automatic converter that will be based on the default value of the corresponding settings. In most cases will this be sufficient but in some instances a custom converter might be needed. This custom converter will in most cases get a string as input and be expected to return the correct type.

These converters will be used by the cli to convert inputs given to the cli directly.

For convenience several types of converters exists in `roc` that can be imported from `roc/converters`. For a complete list of them please see [the JSDocs](/docs/JSDocs.md).
