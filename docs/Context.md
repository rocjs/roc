# Context

When a [command is invoked in Roc](/docs/CLI.md) or when manually [adding the runtime to a project](/docs/Runtime.md#manually-adding-the-runtime) a context object will be built that is used in several places in Roc. This object contains important information about the current state of the project created by the runtime.

__Object structure__
```javascript
{
  actions: [], // All registered actions, by the extensions and the project itself
  commands: {}, // All available commands from all the extensions
  config: {}, // The complete configuration from the extensions and the project
  dependencies: {
    exports: {}, // The dependencies that is exported from the dependencies and will be available in the project
    uses: {}, // The dependencies that are used in the different extensions
    requires: {}, // The dependencies that are required by the different extensions
  },
  directory: '', // The path to the directory where the runtime is running inside
  extensionConfig: {}, // The configuration before the user configuration is added
  hooks: {}, // All the registered hooks from the extensions
  meta: {}, // The meta configuration from the extensions
  packageJSON: {}, // Content of the projects package.json
  projectExtensions: [], // The extensions that the project directly depend on
  usedExtensions: [], // All the used extensions that are used, direct and indirect
  verbose: false/true // If the runtime is started in verbose mode or not
}
```

### `actions`
An array with objects with actions for each extension.

```javascript
[{
  actions: [{ // roc.actions
    action: () => {},
    description: 'The decription',
    extension: 'roc-package-example',
    hook: 'hook-name',
    post: () => {},
  }],
  name: 'roc-package-example', // The of the extension that registrated the actions, or the project name
  project: false, // true if the actions are from the project
}]
```

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


### `commands`
An object with the merged commands.

The structure of the object is the same as the one used in the [Roc object](#commands) with the exception for `__extensions` and `__context` that Roc will add when building the context to the groups and the commands.

__`__extensions`__  
This property is an array with strings that list all of the extensions that have modified it in some way. This is used in the core together with `override` to make sure that extensions knowingly override groups and commands defined by other extensions.

__`__context`__  
This is the path to the extension that registered the command. This is used internally for giving access to `node_modules/.bin` when invoking a string command.

### `config`
An object containing the final configuration. This means that the project configuration will have been merged with the configuration from the packages as well as the settings that was defined in the cli at runtime and the `__raw` values added to their properties in `settings`.

### `dependencies`

#### `exports`
An object where the key is the dependency with objects for the exported dependencies from the extensions.

```javascript
{
  dependencyName: {
    context, // the location of the extension
    version, // semver for required version
    extension, // the name of the extension
    resolve, // custom resolve function
  }
}
```

#### `requires`
An object where the key is the dependency with objects for the required dependencies by the extensions.

```javascript
{
  dependencyName: {
    context, // the location of the extension
    version, // semver for required version
    extension, // the name of the extension
  }
}
```

#### `uses`
An object where the key is the extension with objects where the key is the dependency. Lists all of the used dependencies by the extensions.

```javascript
{
  extensionName: {
    dependencyName: {
      context, // the location of the extension
      version, // semver for required version
      extension, // the name of the extension
    }
  }
}
```

### `directory`
A string with the path for the directory that the runtime is running inside. Will by default be `process.cwd()`.

### `extensionConfig`
An object with the merged configuration object from all of the extensions. This means that this does not contain the project configuration or settings set on the CLI.

[See here for the configuration structure.](/docs/Configuration.md)

### `hooks`
An object with objects with actions for each extension.

```javascript
{
  'extension-name': roc.hooks
}    
```

Will be an object where the key is the extension that the hook belongs to and the value is an object with the hooks definitions, [see what it can contain here](/docs/Extensions.md#hooks).

### `meta`
An object with the merged meta configuration.

The structure of the object is the same as the one used in the [Roc object](#config) with the exception for `__extensions` that Roc will add when building the context. This property is an array with strings that list all of the extensions that have modified it in some way. This is used in the core together with `override` to make sure that extensions knowingly override configuration defined by other extensions.

### `packageJSON`
The complete `package.json` for the extension.

### `projectExtensions`

```javascript
[{
  description: roc.description,
  name: roc.name,
  packageJSON: {} // The extensions packageJSON if one exists, or if provided on roc.packageJSON if standalone
  path: '/some/path', // The location of the extension on the disc
  standalone: roc.standalone,
  type: 'package' / 'plugin',
  version: roc.version,
  parents: [{ name, version }, { name, version }, ...], // The parents that the extension have
}]
```

### `usedExtensions`

```javascript
[{
  description: roc.description,
  name: roc.name,
  packageJSON: {} // The extensions packageJSON if one exists, or if provided on roc.packageJSON if standalone
  path: '/some/path', // The location of the extension on the disc
  standalone: roc.standalone,
  type: 'package' / 'plugin',
  version: roc.version,
  parents: [{ name, version }, { name, version }, ...], // The parents that the extension have
}]
```

### `verbose`
A boolean that informs if we the runtime was started in verbose or not.

Will be set to `true` if `-V, --verbose` was set. Should be used to print extra information.
