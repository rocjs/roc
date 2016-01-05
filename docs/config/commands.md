# `commands`

**Table of Contents**
* [Overview](#overview)
* [String command](#string-command)
* [Function command](#function-command)
* [Meta](#meta)

## Overview
Defined in the [Roc configuration object](/docs/config/README.md), often referred to as `roc.config.js`, and contains commands defined by the the different extensions and Roc itself.

This is a powerful feature of Roc that makes it easy to add new commands that can be used with the cli. Roc expects that the commands key have keys for each of the commands that is either a string or a function. See example below for a valid structure.

```js
module.exports = {
    commands: {
        command1: someFunction,
        command2: 'eslint .'
    }
}
```

The name of the key will be the name of the command. Meaning that the example above would run by typing `roc command1` or `roc command2`.

## String command
A string command is a string that will managed as if it was typed into the terminal directly. Great for creating aliases to other commands. Does not work exactly as one would run things in a terminal but `&` and `&&` can be used to chain commands together. This feature is experimental in it's current state and will be improved going forward.

## Function command
The function will be invoked with an object with the following properties.
```
debug               If debug mode has been enabled
configObject        The final configuration object where everything has been merged
metaObject          The final meta configuration object where everything has been merged
extensionConfig     The configuration object where all extensions has been merged
parsedOptions       The parsed options given to the cli
```

### debug
Debug will be set to `true` if `-d, --debug` was set. Should be used to print extra information when running the command. Otherwise it will be `false`.

### configObject
Will contain the final configuration object. This means that the application configuration will have been merged with the configuration from the extensions as well as the settings that was defined in the cli at runtime.

### metaObject
Will contain the final meta configuration object. This means that the application configuration will have been merged with the configuration from the extensions.

### extensionConfig
The configuration object where all extensions has been merged. This means that this does not contain the application configuration or settings set in the cli.

### parsedOptions
An object with the following properties:
```
arguments           Object with the parsed arguments from the cli as key-value
rest                Arguments that was not matched with anything
```

What arguments that are parsed is defined by the related meta object for the command. See below for more information.

## Meta

Meta for commands are used to better define what they should do and describe what they are used for. It is optional but if used it should match the commands properties. The following properties will be used by Roc if they exists:
```
description         Describes the command
help                Additional information used when printing help for a single command
options             Options object that define what arguments/options the command uses
settings            What roc settings the command uses, can either be true or an array with groups
```

### description
A string that describes what the command does. Used when printing general information about all the possible commands.

### help
Used when printing information about a specific command. The input is reindented and starting/ending newlines are trimmed which means you can use a template literal without having to care about using the correct amount of indent.

### options
An array of objects that can have the following properties:
```
name                The name of the option
validation          A validation function that should return true if valid or false/error string if not
required            If the option is required
```

The order of the objects in the array matter, they are parsed in the same order.

#### name
The name of the option. Will be used for in the cli for information and as the name of the value [parsedOptions](#parsedOptions).

#### validation
Roc assumes that the validators used is either a RegExp or a function that will return true if it's valid or false/error string if it's not.

For convenience several types of validators exists in `roc` that can be imported from `roc/validators`. For a complete list of them please see [the JSDocs](#).

#### required
Set to true if the option is required.

### settings
What roc settings the command uses, can either be true or an array with strings of the groups to use. Will determine what information the cli outputs, what it parses and what it validates.
