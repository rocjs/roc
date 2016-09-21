# Commands for `roc`

## General Information
All commands can be called with some additional options illustrated in the table below.

### General options

| Name                  | Description                                    | Required |
| --------------------- | ---------------------------------------------- | -------- |
| -b, --better-feedback | Enables source-map-support and loud-rejection. | No       |
| -c, --config          | Path to configuration file.                    | No       |
| -d, --directory       | Path to working directory.                     | No       |
| -h, --help            | Output usage information.                      | No       |
| -V, --verbose         | Enable verbose mode.                           | No       |
| -v, --version         | Output version number.                         | No       |

## Commands
* [lock](#lock)
* [create](#create)
    * [init](#init)
    * [new](#new)
* [meta](#meta)
    * [docs](#docs)
    * [list-settings](#list-settings)

## lock
__Locks down Roc dependencies to fixed alpha versions.__

```
roc lock
```

###  Defined by extensions
roc

## create
__Project creation__

```
roc create <command>
```
Commands that can be used to create new projects.


### init
__Init a new project.__

```
roc create init [template] [version]
```
The __init__ command can be used to initiate a new Roc project and currently expects that it is run inside an empty directory. As shown above it takes two optional arguments, template and version. If no template is given a prompt will be displayed with the possible alternatives that exist. Currently these alternatives are coded into Roc and matches `web-app` and `web-app-react`.

__template__
Template can either be a short name for a specific template, currently it accepts `web-app` and `web-app-react` that will be converted internally to `rocjs/roc-template-web-app` and `rocjs/roc-template-web-app-react`. The actual template reference is a Github repo and can be anything matching that pattern `USERNAME/PROJECT`.

The template can also point to a local zip file (ending in `.zip`) of a template repository. This is useful if the template is in a private repo or not available on GitHub.

It will also expect that the template has a folder named `template` that contains a `package.json` file with at least one dependency to a Roc package following the pattern `roc-package-*` or that it has a `roc.config.js` file (this file is then expected to have some [packages](/docs/config/packages.md) defined but this is not checked immediately).

__version__
Versions should match a tag on the Github repo and will default to master if none exists. When providing an input on the command line Roc will automatically add `v` in front of versions that starts with a number to match Github default conventions that have version tags that start with `v` like `v1.0.0`. `master` is also always available as an option.

#### Arguments

| Name                | Description                                                | Default | Type       | Required | Can be empty |
| ------------------- | ---------------------------------------------------------- | ------- | ---------- | -------- | ------------ |
| template            | The template to use.                                       |         | `Filepath` | No       | No           |
| version             | The version of the template to use.                        |         | `String`   | No       | No           |

#### Command options

| Name                | Description                                                | Default | Type       | Required | Can be empty |
| ------------------- | ---------------------------------------------------------- | ------- | ---------- | -------- | ------------ |
| --clone             | If git clone should be used when downloading the template. |         | `Boolean`  | No       |              |
| -f, --force         | Ignore non empty directory warning.                        |         | `Boolean`  | No       |              |
| -l, --list-versions | List the available versions of a template.                 |         | `Boolean`  | No       |              |

####  Defined by extensions
roc

### new
__Create a new project.__

```
roc create new <name> [template] [version]
```
Alias for "init" that always will try to create a new directory.

#### Arguments

| Name                | Description                                                | Default | Type       | Required | Can be empty |
| ------------------- | ---------------------------------------------------------- | ------- | ---------- | -------- | ------------ |
| name                | Name for a new directory to create the project in.         |         | `String`   | Yes      | No           |
| template            | The template to use.                                       |         | `Filepath` | No       | No           |
| version             | The version of the template to use.                        |         | `String`   | No       | No           |

#### Command options

| Name                | Description                                                | Default | Type       | Required | Can be empty |
| ------------------- | ---------------------------------------------------------- | ------- | ---------- | -------- | ------------ |
| --clone             | If git clone should be used when downloading the template. |         | `Boolean`  | No       |              |
| -f, --force         | Ignore non empty directory warning.                        |         | `Boolean`  | No       |              |
| -l, --list-versions | List the available versions of a template.                 |         | `Boolean`  | No       |              |

####  Defined by extensions
roc

## meta
__Meta commands__

```
roc meta <command>
```
Meta commands that can be used to generate meta data about the current project.


### docs
__Generates documentation for the current project.__

```
roc meta docs
```

#### Command options

| Name       | Description                                                   | Default        | Type                                                              | Required | Can be empty |
| ---------- | ------------------------------------------------------------- | -------------- | ----------------------------------------------------------------- | -------- | ------------ |
| --html     | If HTML should be generated. (Not supported yet)              | `false`        | `Boolean`                                                         | No       |              |
| --markdown | If markdown should be generated.                              | `true`         | `Boolean`                                                         | No       |              |
| --mode     | The platform that is to be used, for link generation.         | `"github.com"` | `/github\.com|nodejs\.org|bitbucket\.org|ghost\.org|gitlab\.com/` | No       |              |
| --output   | A directory to place the generated documentation inside of.   | `"docs"`       | `String`                                                          | No       | No           |
| --project  | If the projects configuration and actions should be included. | `false`        | `Boolean`                                                         | No       |              |

####  Defined by extensions
roc

### list-settings
__Prints all the available settings that can be changed.__

```
roc meta list-settings
```

####  Defined by extensions
roc

