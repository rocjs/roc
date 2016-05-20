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
verbose             If verbose mode has been enabled
directory           Path to working directory
info                The object that is passed to the runCli function with version and name
configObject        The final configuration object where everything has been merged
metaObject          The final meta configuration object where everything has been merged
packageConfig       The configuration object where all packages has been merged
parsedArguments     The parsed arguments given to the cli
parsedOptions       The parsed options given to the cli
hooks               The currently registered hooks
actions             The currently registered actions
```

### verbose
Debug will be set to `true` if `-V, --verbose` was set. Should be used to print extra information when running the command. Otherwise it will be `false`.

### directory
If set it will be used as the current working directory. The path can be either relative to the current working directory or absolute.

### info
The same information object as `runCli` was invoked with, meaning it should have two properties.
```
version             The version of the running cli
name                The name of the running cli
```

### configObject
Will contain the final configuration object. This means that the application configuration will have been merged with the configuration from the packages as well as the settings that was defined in the cli at runtime.

### metaObject
Will contain the final meta configuration object. This means that the application configuration will have been merged with the configuration from the packages.

### packageConfig
The configuration object where all packages has been merged. This means that this does not contain the application configuration or settings set in the cli.

### parsedArguments
An object with the following properties:
```
arguments           Object with the parsed arguments from the cli as key-value
rest                Arguments that was not matched with anything
```

What arguments that are parsed is defined by the related meta object for the command. See below for more information.

### parsedOptions
An object with the following properties:
```
options             Object with the parsed options from the cli as key-value
rest                Options that was not matched with anything
```

What options that are parsed is defined by the related meta object for the command. See below for more information.

### hooks
Will be an object where the key is the extension that the hook belongs to and the value is an object with the hooks definitions, [see what it can contain here](/docs/Extensions.md#hooks).

```js
/**
 * A complete hook object in Roc.
 *
 * @typedef {Object} rocHook
 * @property {boolean} [hasCallback] - If the hook uses a callback to do something with what the action returns.
 * @property {Object} [initialValue] - An initial value used for the hook.
 * @property {function} [returns] - A Roc validation function that should verify the value that the action returns.
 * @property {Object[]} arguments - The arguments that the hook will call the actions with.
 * @property {string} [description] -A description on what it does, used for documentation generation and can use Markdowns.
 */
```

### actions
Will be an array with objects with the following properties:
```
name                The extension that the actions belongs to.
actions             Action objects.
```

[See definition of action object here.](/docs/Extensions.md#actions)

```js
/**
 * A complete action object in Roc.
 *
 * @typedef {Object} rocAction
 * @property {string} [extension] - For which extension this action should run.
 * @property {string} [hook] - For which hook this action should run.
 * @property {string} [description] -A description on what it does, used for documentation generation and can use Markdowns.
 * @property {function} action - The action function that does the actual work, see documentation for more info here.
 */
```

## Meta

Meta for commands are used to better define what they should do and describe what they are used for. It is optional but if used it should match the command properties. The following properties will be used by Roc if they exists:
```
description         Describes the command
help                Additional information used when printing help for a single command
markdown            Markdown formatted text that will be used, if available, when using "markdown-commands"
options             Command line options that the command uses that are not part of the settings
arguments           Arguments object that define what arguments the command uses
settings            What roc settings the command uses, can either be true or an array with groups
```

### description
A string that describes what the command does. Used when printing general information about all the possible commands.

### help
Used when printing information about a specific command. The input is reindented and starting/ending newlines are trimmed which means you can use a template literal without having to care about using the correct amount of indent. If no `help` is provided the `description` will be used instead.

### markdown
Used when generating documentation for the commands.  The input is reindented and starting/ending newlines are trimmed which means you can use a template literal without having to care about using the correct amount of indent. If no `markdown` is provided the `help` will be used instead.

### arguments
An array of objects that can have the following properties:
```
name                The name of the option
validation          A validation function that should return true if valid or false/error string if not
required            If the option is required
description         A text that describes how the option can be used
default             A default value that should be used for the argument
converter           A converter that should be used to convert the input to the correct format
```

The order of the objects in the array matter, they are parsed in the same order.

#### name
The name of the argument. Will be used for in the cli for information and as the name of the value [parsedArguments](#parsedArguments).

#### validation
Roc assumes that the validators used is either a RegExp or a function that will return true if it's valid or false/error string if it's not.

For convenience several types of validators exists in `roc` that can be imported from `roc/validators`. For a complete list of them please see [the JSDocs](/docs/JSDocs.md).

#### required
Set to true if the option is required.

#### description
Describes what it can be used for.

#### default
The value that the argument will hold if nothing is provided by the user.

#### converter
A converter to be used to convert the input to some other format. Should match the following format `(input) => output`.

### options
An array of objects that can have the following properties:
```
name                The name of the option, will be used as '--name'
shortname           The shortname for the option, will be used as '-shortname' and should be a single character
validation          A validation function that should return true if valid or false/error string if not
required            If the option is required
description         A text that describes how the option can be used
default             A default value that should be used for the argument
converter           A converter that should be used to convert the input to the correct format
```

#### name
The name of the option. Will be used for in the cli for information and as the name of the value [parsedOptions](#parsedOptions).

#### shortname
The shortname of the option. Should be a single character long.

#### validation
Roc assumes that the validators used is either a RegExp or a function that will return true if it's valid or false/error string if it's not.

For convenience several types of validators exists in `roc` that can be imported from `roc/validators`. For a complete list of them please see [the JSDocs](/docs/JSDocs.md).

#### required
Set to true if the option is required.

#### description
Describes what it can be used for.

#### default
The value that the option will hold if nothing is provided by the user.

#### converter
A converter to be used to convert the input to some other format. Should match the following format `(input) => output`.

### settings
What roc settings the command uses, can either be true or an array with strings of the groups to use. Will determine what information the cli outputs, what it parses and what it validates.
