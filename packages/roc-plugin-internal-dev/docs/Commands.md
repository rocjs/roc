# Commands for `@rocjs/roc-plugin-internal-dev`

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
* [rid](#rid)
    * [build](#build)
    * [build:watch](#buildwatch)
    * [clean](#clean)
    * [docs](#docs)
    * [esdocs](#esdocs)
    * [link](#link)
    * [lint](#lint)
    * [lint:alias](#lintalias)
    * [list](#list)
    * [release](#release)
    * [rnm](#rnm)

## rid
```
roc rid <command>
```

### build
__Builds project__

```
roc rid build
```

####  Defined by extensions
@rocjs/roc-plugin-internal-dev

### build:watch
__Builds project in watch mode__

```
roc rid build:watch
```

####  Defined by extensions
@rocjs/roc-plugin-internal-dev

### clean
__Cleans generated files__

```
roc rid clean
```

####  Defined by extensions
@rocjs/roc-plugin-internal-dev

### docs
__Generates markdown documentation__

```
roc rid docs
```

####  Defined by extensions
@rocjs/roc-plugin-internal-dev

### esdocs
__Generates ESDoc__

```
roc rid esdocs
```

####  Defined by extensions
@rocjs/roc-plugin-internal-dev

### link
__Links up the project__

```
roc rid link [modules]
```

#### Arguments

| Name    | Description                                                      | Default | Type      | Required | Can be empty |
| ------- | ---------------------------------------------------------------- | ------- | --------- | -------- | ------------ |
| modules | Modules that should be linked into the extensions in extensions/ |         | `Array()` | No       | Yes          |

#### Command options

| Name    | Description                                                      | Default | Type      | Required | Can be empty |
| ------- | ---------------------------------------------------------------- | ------- | --------- | -------- | ------------ |
| --yarn  | If yarn should be used over npm                                  | `false` | `Boolean` | No       |              |

####  Defined by extensions
@rocjs/roc-plugin-internal-dev

### lint
__Runs lint__

```
roc rid lint
```

####  Defined by extensions
@rocjs/roc-plugin-internal-dev

### lint:alias
__Run local lint inside packages__

```
roc rid lint:alias
```

####  Defined by extensions
@rocjs/roc-plugin-internal-dev

### list
__List the projects that will be used when running the commands__

```
roc rid list
```

####  Defined by extensions
@rocjs/roc-plugin-internal-dev

### release
__Run release script__

```
roc rid release
```

#### Command options

| Name        | Description                                                       | Default | Type      | Required | Can be empty |
| ----------- | ----------------------------------------------------------------- | ------- | --------- | -------- | ------------ |
| --next      | Publish to next tag on npm                                        | `false` | `Boolean` | No       |              |
| --use-alias | If lint:alias should be used over the default lint when releasing | `false` | `Boolean` | No       |              |

####  Defined by extensions
@rocjs/roc-plugin-internal-dev

### rnm
__Removes node_modules folders in extensions/__

```
roc rid rnm
```

####  Defined by extensions
@rocjs/roc-plugin-internal-dev

