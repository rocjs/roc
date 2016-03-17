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
The meta settings, often referred to as `roc.config.meta.js` are used to add **descriptions** and **validations** to the settings as a way to both document them and make interaction with them better. See example below for a valid structure.

```js
module.exports = {
    settings: {
        descriptions: {
            group1: {
                // …
            },
            group2: {
                // …
            }
        },
        groups: {
            group1: 'Description for 1',
            group2: {
                _description: 'Description for 2',
                subgroup: 'Description for subgroup'
            },
        }
        validations: {
            group1: {
                // …
            },
            group2: {
                // …
            }
        }
    }
}
```

As can be seen in the example above the Roc settings meta object can have 3 properties; `descriptions`, `groups`, `validations`.

### `descriptions`
Should mirror the groups and general structure of the normal settings object adding description to the properties. These descriptions will be shown when using the cli and when generation documentation for the settings.

See [roc.config.meta.js in roc-web for an example of how the configuration might look](https://github.com/vgno/roc-web/blob/master/src/roc/config/roc.config.meta.js#L11).

### `groups`
Can be used to add descriptions to the groups that will be used when using the cli and when generation documentation for the settings. Use the special property `_description` to add description to a group when you also want descriptions to sub groups within it.

### `validations`
Should mirror the groups and general structure of the normal settings object adding validations to the properties. These validations will be used by the cli to verify the configuration structure and inputs given to the cli directly.

Roc assumes that the validators used is either a RegExp or a function that will return true if it's valid or false/error string if it's not. The functions can also take a optional second argument. If it is true it should return a string with information about what the validator expects for input, the required type you could call it. This information is later used when generating documentation.

For convenience several types of validators exists in `roc` that can be imported from `roc/validators`. For a complete list of them please see [the JSDocs](/docs/JSDocs.md).

See [roc.config.meta.js in roc-web for an example of how the configuration might look](https://github.com/vgno/roc-web/blob/master/src/roc/config/roc.config.meta.js#L62).
