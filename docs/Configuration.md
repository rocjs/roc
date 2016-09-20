# Configuration
Roc features a configuration system that makes it possible for extensions to define useful data that other extensions and projects can use.

## Configuration in Extensions
Configuration in extensions are similar to projects with some slight differences. Mainly the existence of a meta configuration that can be used to further enhance the user experience and documentation generation.

### Configuration
The configuration object in extensions has one property that is specially managed by Roc, `settings`, and one that extensions are not allowed to define, `project`. Other than that extensions are free to define additional properties as they need.

__Example__
```javascript
{
    settings: {},

    custom: {}
}
```

#### `settings`
[Read more about settings here.](/docs/Settings.md)

#### Custom properties
Extensions are allowed to define additional properties to suit their needs. An example of this could be something that does not make sense to provide within the normal settings managed by the core. In general it is recommended to use `settings` to get the best possible documentation generation as well as allowing a user to define things on the command line. With custom properties you lose this.

__Example__
```javascript
{
    custom: {},
    custom2: 4
}
```

### Meta Configuration
The meta configuration should mirror the normal configuration structure.

#### `settings`
[Read more here.](/docs/Settings.md)

#### Custom properties
Custom properties that are defined by extensions can define useful meta information, `description` and `override`.

__Example__
```javascript
{
    custom: {
        description: 'Some description',
        override: true
    },

    custom2: {
        description: (commandObject, configurationForProperty) => '',
        override: 'roc-package-example'
    }
}
```
##### `description`
A string or a function that returns a string. Used when generating documentation and can contain markdown.

__Function__
```javascript
(rocCommandObject, configurationForProperty) => String
```
`commandObject`  
[The command object.](/docs/Commands.md#command-object)

`configurationForProperty`
The final configuration value for the property.

## Configuration in Projects
Roc projects can be configured to a great extent using the `roc.config.js` file. By default it’s assumed that it is located inside the current working directory, that is from the directory where the command was invoked. You can override both the expected filename and the directory for the lookup using the command line interface, see below for more information.

Once imported to your project the configuration will persist throughout the process lifetime and it’s recommended that it is treated as it would be immutable.

### Expected structure
Roc expects that the `roc.config.js` exports an object and by default some properties are managed as illustrated in the example below. Extensions can add more managed properties.

__Example__
```javascript
module.exports = {
  settings: {},
  project: {
    actions: [],
    init: () => {}
  },

  // Extension defined / custom properties
  custom: {}
};
```

#### `settings`
See the documentation for the extensions that are used in the project or the generated documentation from `roc meta docs` for the available settings.

[Read more here.](/docs/Settings.md)

#### `project`

##### `actions`
A function or an array of functions and/or objects. The functions and objects work in the same way as for extensions.

See the documentation for the extensions that are used in the project or the generated documentation from `roc meta docs` for the available hooks that the project can register actions on.

[See more here about the general structure.](/docs/Hooks.md#actions)

##### `init`
A function that work much in the [same way as for extensions](/docs/RocObject.md#init). Can be used to modify the context in an advanced way. Most users will not need to use this.

__Example__
```javascript
({ context }) => {}
```

__`context`__  
The [context object](/docs/Context.md).

#### Return value
Should return an object with the structure below, can both override properties from the extensions Roc object and update the context. Can also return `false` if nothing should be processed.

__Example__  
```
{
  roc: {
    actions,
    commands,
    config,
    hooks,
    meta
  },
  context: {
    actions,
    commands,
    config,
    dependencies,
    meta
  }
}
```

__`roc`__  
Will be shallow merged with the values already present directly on the Roc object.

Supports specifying:
- actions
- commands
- config
- hooks
- meta

__`context`__  
Will replace the already present values on the context.

Supports specifying:
- actions
- commands
- config
- dependencies
- meta

_Note:_ `hooks` are not present in the `context` object. This since it would not make sense to remove registered hooks from other extensions.

_Note:_ `dependencies` are not present in `roc`.

### Override working directory

```
roc <command> --directory path/to/directory
```
You can override the current working directory using the `-d, --directory` option. The path can be either relative to the current working directory or absolute.

This will not only change where Roc looks for the `roc.config.js` file but from where the entire runtime is started inside.

### Override configuration file

#### Specifying in `package.json`

It’s possible to define where Roc should look for the `roc.config.js` by default by specifying a path inside the `package.json`. The path can be either relative to the current working directory or absolute.

```json
{
  ...
  "dependencies": {
    ...
  },
  "roc": {
      "config": "./some/path/roc.config.js"
  }
}
```

#### Using the command line
```
roc <command> --config path/to/roc.config.js
```
You can override the current the location and name for the `roc.config.js` file using the `-c, --config` option. The path can be either relative to the current working directory or absolute. This option will override a potential value defined in the `package.json`.

#### Using the environment variable
Roc will look for two environment variables `ROC_CONFIG_PATH`, will override the previous ones.

##### `ROC_CONFIG_PATH`
If a configuration file path is provided by environment variable `ROC_CONFIG_PATH` it will load this instead of a configuration file within the project, without merging the two.

## Merge behavior
One big part of the configuration management in Roc is how configuration files are merged. Application configurations, and by default in extensions, are deeply merged using [merge-options](https://www.npmjs.com/package/merge-options).

This results in that the merge is based on properties and values for those properties. Duplicated properties will overwrite each other. That means for instance that arrays will not be magically merged but rather overwrite the old value. A benefit of this is that it becomes trivial to override something defined in extensions.
