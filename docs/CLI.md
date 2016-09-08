# Command line interface

Roc has a powerful and dynamic command line interface that features different commands depending on the context from which it is invoked. This means that only relevant commands are available at any given moment.

To get all currently available commands one can just enter `roc` or `roc -h` and a complete list will be given to the user. To get information about a specific command or command group you can always use the `-h, --help` option.

## Global Install

You do not need to install `roc` globally but it will make it easier to use commands like the `init` to easily setup new projects.

## Overview

__Important!__
The property name `command` is reserved and should not be used as the name for a command group or command.

### Groups

The command line interface in Roc supports command groups that makes it possible to group similar commands together. The groups can be as nested as one would like and need.

You will not have to write the entire command with all its groups for convenience in most cases. Roc will look in the current context and try to find a match for you. This means that if there are two commands that are called the same thing in different groups the user will be asked to be more specific.

__Example__
```bash
roc group1 first
roc group1 second
roc group2 second
roc group2 group3 third
```

Let’s look at an example of this to make it a bit more clear.
Say we have the commands above available to use in the current context. A user would be able to write `roc first` here and the first command would be invoked, this will be the same thing as writing `roc group1 first`. However if the user would now type `roc second` we would match 2 potential commands and Roc will ask the user to be more precise. Both `roc group1 second` and `roc group2 second` would work fine here.

This shorthand syntax also works inside groups. So we could use `roc group2 third` or `roc third` over the fully correct `roc group2 group3 third` if we want.

### Default options

All commands have some default options that can be used together with them.

| Name                  | Description                                                                                                   | Required |
| --------------------- | ------------------------------------------------------------------------------------------------------------- | -------- |
| -b, --better-feedback | Will enable source-map-support and loud-rejection for a better experience with better feedback.               | No       |
| -c, --config          | Path to configuration file, will default to roc.config.js in current working directory.                       | No       |
| -d, --directory       | Path to working directory, will default to the current working directory. Can be either absolute or relative. | No       |
| -h, --help            | Output usage information.                                                                                     | No       |
| -V, --verbose         | Enable verbose mode.                                                                                          | No       |
| -v, --version         | Output version number.                                                                                        | No       |

### Default commands

Some commands are default, this means that they are not owned by any specific extension. These commands come from the core, `roc`, and some of them will always be present while others will only be available in valid Roc projects.

The `meta` group commands will only be available in valid Roc projects while the `create` group is always present no matter the context.

[See the commands here.](/docs/default/Commands.md)

### Add commands from extensions
Extensions can define new commands and change existing ones through their interface, [Roc object](/docs/RocObject.md#commands).

[Read more here about how to define extensions in general below.](#add-commands)

## How the CLI operates on user input

### Arrays
In Roc arguments and options that take arrays as values need to separate the values using a comma (together with `toArray`) or multiple flags.

__Example__
```
$ roc <command> --options 1,2,3,4
```
`toArray(options) = [1,2,3,4]`

```
$ roc <command> --options 1 --options 2 --options 3 --options 4
```
`options = [1,2,3,4]`

### Booleans
Roc will consider options without a value as `true` and also support a `no-` prefix to set an option to `false`.

__Example__
```
$ roc <command> --option
```
`option = true`

```
$ roc <command> --no-option
```
`option = false`
