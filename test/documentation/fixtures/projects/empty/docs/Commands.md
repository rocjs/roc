# Commands for `empty`

## General Information
All commands can be called with some additional options as can be seen below.

### General options

| Name                  | Description                                                                                                   | Required |
| --------------------- | ------------------------------------------------------------------------------------------------------------- | -------- |
| -b, --better-feedback | Will enable source-map-support and loud-rejection for a better experience with better feedback.               | No       |
| -c, --config          | Path to configuration file, will default to roc.config.js in current working directory.                       | No       |
| -d, --directory       | Path to working directory, will default to the current working directory. Can be either absolute or relative. | No       |
| -h, --help            | Output usage information.                                                                                     | No       |
| -V, --verbose         | Enable verbose mode.                                                                                          | No       |
| -v, --version         | Output version number.                                                                                        | No       |

## Commands
* [create](#create)
    * [init](#init)
    * [new](#new)
* [meta](#meta)
    * [docs](#docs)
    * [list-settings](#list-settings)

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
The __init__ command can be used to initiate a new Roc project and currently expects that it's run inside an empty directory. As can be seen above it takes two optional arguments, template and version. If no template is given a prompt will be shown with the possible alternatives that exists. Currently these alternatives are coded into Roc and matches `web-app` and `web-app-react`.

__template__
Template can either be a short name for a specific template, currently it accepts `web-app` and `web-app-react` that will be converted internally to `rocjs/roc-template-web-app` and `rocjs/roc-template-web-app-react`. As can be seen here the actual template reference is a Github repo and can be anything matching that pattern `USERNAME/PROJECT`.

The template can also point to a local zip file (ending in `.zip`) of a template repository. This is useful if the template is on a private repo or not on GitHub.

It will also expect that the template has a folder named `template` and that inside of it there is `package.json` file with at least one dependency to a Roc module following the pattern `roc-package-*` or that it has a `roc.config.js` file (this file is then expected to have some [packages](/docs/config/packages.md) defined but this is not checked immediately).

__version__
Versions should match a tag on the Github repo and will default to master if none exists. When giving an input on the command line Roc will automatically add `v` in front of versions that starts with a number to match Github default that have versions tags that start with `v` like `v1.0.0`. `master` is also always available as an option.

#### Arguments

| Name        | Description                                                                           | Default | Type       | Required | Can be empty |
| ----------- | ------------------------------------------------------------------------------------- | ------- | ---------- | -------- | ------------ |
| template    | The template to use. Matches Github structure with Username/Repo or a local zip file. |         | `Filepath` | No       | No           |
| version     | The version to use.                                                                   |         | `String`   | No       | No           |

#### Command options

| Name        | Description                                                                           | Default | Type       | Required | Can be empty |
| ----------- | ------------------------------------------------------------------------------------- | ------- | ---------- | -------- | ------------ |
| -f, --force | Ignore non empty directory warning.                                                   |         | `Boolean`  | No       |              |
| -l, --list  | List the available versions of a template.                                            |         | `Boolean`  | No       |              |

####  Defined by extensions
roc

### new
__Create a new project.__

```
roc create new <name> [template] [version]
```
Alias for "init" that always will try to create a new directory.

#### Arguments

| Name        | Description                                                                           | Default | Type       | Required | Can be empty |
| ----------- | ------------------------------------------------------------------------------------- | ------- | ---------- | -------- | ------------ |
| name        | Name for a new directory to create the project in.                                    |         | `String`   | Yes      | No           |
| template    | The template to use. Matches Github structure with Username/Repo or a local zip file. |         | `Filepath` | No       | No           |
| version     | The version to use.                                                                   |         | `String`   | No       | No           |

#### Command options

| Name        | Description                                                                           | Default | Type       | Required | Can be empty |
| ----------- | ------------------------------------------------------------------------------------- | ------- | ---------- | -------- | ------------ |
| -f, --force | Ignore non empty directory warning.                                                   |         | `Boolean`  | No       |              |
| -l, --list  | List the available versions of a template.                                            |         | `Boolean`  | No       |              |

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
| --output   | A directory to place the generated documentation inside of.   | `"docs"`       | `Boolean`                                                         | No       |              |
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

