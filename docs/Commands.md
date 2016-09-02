# Commands
Extensions can define their own commands with the help of [the Roc object](/docs/RocObject.md). This is a powerful feature of Roc that makes it easy to add new commands that can be used with the CLI.

## General
Roc expects that the commands is either a string or a function. See example below for a valid structure.

```javascript
module.exports = {
    commands: {
        command1: someFunction,
        command2: `${require.resolve('eslint/bin/eslint.js')} .`,

    }
}
```

The name of the key will be the name of the command. Meaning that the example above would run by typing `roc command1` or `roc command2`. [See more here about how commands are managed.](/docs/CLI.md)

__Important!__
The property name `command` is reserved and should not be used as the name for a command group or command.

### String command
A string command is a string that will managed as if it was typed into the terminal directly. Great for creating aliases to other commands. Does not work exactly as one would run things in a terminal but `&` and `&&` can be used to chain commands together. This feature is experimental in it’s current state and will be improved going forward.

String commands uses [execute](/docs/API.md#execute) internally.

### Function command
The function will be invoked with an object called `commandObject`.

__Example__
```javascript
(commandObject) => { /* do stuff */ }
```

See below for more details.

## Command Object
Object that is built when running the command line interface and what command functions get as their first argument, called `commandObject`.

__Object structure__
```javascript
{
  context: context,
  info: {
    name: 'roc',
    version: '1.0.0'
  },
  arguments: {
    managed: {}
    unmanaged: []
  },
  options: {
    managed: {}
    unmanaged: {}
  }
}
```

### `context`
The context object in Roc.

[Read more about the context object here.](/docs/Context.md)

### `info`
An object containing information about the `name` and the `version` as strings for the CLI that was invoked.

### `arguments`
An object with the arguments that was passed to the command.

#### `managed`
An object with values matching the defined arguments from the commands meta information as key-value.

#### `unmanaged`
An array with the arguments that was not managed by Roc.

### `options`
An object with the options that was passed to the command. Will not include options from the settings.

#### `managed`
An object with options matching the defined options from the commands meta information as key-value.

#### `unmanaged`
An object with options that was not managed by Roc.

## Define new commands & groups
To define new commands that extension will need to either use the [`command`](/docs/RocObject.md#commands)  property on the [Roc object](/docs/RocObject.md) or return a command property form the [`init`](/docs/RocObject.md#init) function.

__Example__
```javascript
commands: {
  command0: commandFunction0,
  group: {
    __meta: {
      ...
    },
    command1: {
      command: commandFunction1,
      description: 'Explaining what the command does.'
    },
    command2: commandFunction2
  }
}
```

### Group
Groups are used to group commands and other groups. A group can contain other groups and one to several commands.

#### `__meta`
Used for groups to define additional meta data.

__Example__
```javascript
group: {
  description: 'A description for what the group does',
  markdown: 'A __markdown__ description for the what the group does',
  name: 'My Group',
  override: 'roc-package-example'
}
```

##### `description`
Description that will be shown when using `--help` for the group and when generating documentation by default.

##### `markdown`
Markdown formatted text that will be used, if available, when using `roc meta docs`, will be used over description if existing.

##### `name`
A string with the name for the group, can be used to show something over the property name that is the default.

##### `override`
A string or a boolean that is to be used if the group already is created from before. The override will need to be specified to either the extension that defined it previously or true for always overriding.

### Command
A command can be either a string, a function or an object. It’s recommended to use objects since it will allow both string and function commands to be used along with additional meta information.

__Example__
```javascript
command1: 'eslint .',
command2: commandFunction2,
command3: {
  arguments: [],
  command: commandFunction3,
  description: 'A description for the command',
  help: 'A help text for the command, longer than the description.'
  markdown: 'A __markdown__ text for the command.',
  options: [],
  override: 'roc-package-example',
  settings: ['dev']
}
```

#### `arguments`
An array of objects that define what arguments the command uses. The order of the objects in the array matter, they are parsed in the same order.

__Example__
```javascript
arguments: [{
  converter: toBoolean,
  default: false
  description: 'If something should be enabled or not',
  name: 'feature',
  validator: isBoolean
}]
```

__`converter`__  
A converter to be used to convert the input to some other format. Should match the following format `(input) => output`.

For convenience several types of converters exists in `roc` that can be imported from `roc/converters`. [See here for a complete list of them along with more information on how they work.](/docs/Converters.md).

__`default`__  
The value that the argument will hold if nothing is provided to the CLI.

__`description`__  
 A text that describes how the argument can be used.

__`name`__  
The name of the argument. Will be used for in the CLI for information and as the name of the value in [`commandObject.arguments.managed`](/docs/Commands.md#command-object).

__`validator`__  
Roc assumes that the validators used is either a RegExp or a function that will return true if it's valid or false/error string if it's not.

For convenience several types of validators exists in `roc` that can be imported from `roc/validators`. [See here for a complete list of them along with more information on how they work.](/docs/Validators.md).

#### `command`

#### `description`
A string that describes what the command does. Used when printing general information about all the possible commands.

#### `help`
Used when printing information about a specific command. The input is reindented and starting/ending newlines are trimmed which means you can use a template literal without having to care about using the correct amount of indent. If no `help` is provided the `description` will be used instead.

#### `markdown`
Used when generating documentation for the commands. The input is reindented and starting/ending newlines are trimmed which means you can use a template literal without having to care about using the correct amount of indent. If no `markdown` is provided the `help` will be used instead.

#### `options`
An array of objects that define what options the command uses. The order of the objects in the array does not matter.

__Example__
```
options: [{
  alias: 'f', // Will be used as '-f'
  converter: toBoolean,
  default: false
  description: 'If something should be enabled or not',
  name: 'feature', // Will be used as '--feature'
  validator: isBoolean
}]
```

__`alias`__  
The alias for the option. Should be a single character long.

__`converter`__  
A converter to be used to convert the input to some other format. Should match the following format `(input) => output`.

For convenience several types of converters exists in `roc` that can be imported from `roc/converters`. [See here for a complete list of them along with more information on how they work.](/docs/Converters.md).

__`default`__  
The value that the option will hold if nothing is provided to the CLI.

__`description`__  
 A text that describes how the option can be used.

__`name`__  
The name of the option. Will be used for in the CLI for information and as the name of the value in [`commandObject.options.managed`](/docs/Commands.md#command-object).

__`validator`__  
Roc assumes that the validators used is either a RegExp or a function that will return true if it's valid or false/error string if it's not.

For convenience several types of validators exists in `roc` that can be imported from `roc/validators`. [See here for a complete list of them along with more information on how they work.](/docs/Validators.md).

#### `override`
A string or a boolean that is to be used if the group already is created from before. The override will need to be specified to either the extension that defined it previously or true for always overriding.

#### `settings`
What roc settings the command uses, can either be true or an array with strings of the groups to use. Will determine what information the cli outputs, what it parses and what it validates.

## Modifying existing commands
Extensions can both modify and remove commands from other extensions. The most common use case is to modify a command that that can simply be done by just letting to Roc manage the merge, will require that a correct value for `override` is provided.
