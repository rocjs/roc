# The Roc Object

The Roc object is the API that extensions use when registered with Roc and added to the context.

* API
	* [`actions`](#actions)
	* [`commands`](#commands)
	* [`config`](#config)
	* [`dependencies`](#dependencies)
		* [`exports`](#exports)
		* [`requires`](#requires)
		* [`uses`](#uses)
	* [`description`](#description)
	* [`hooks`](#hooks)
	* [`init`](#init)
	* [`meta`](#meta)
	* [`name`](#name)
	* [`packages`](#packages)
	* [`plugins`](#plugins)
	* [`postInit`](#postinit)
	* [`required`](#required)
	* [`standalone`](#standalone)
	* [`version`](#version)
* [What is considered a valid object](#what-is-considered-a-valid-object)
* [Tip for optimal performance](#tip-for-optimal-performance)

## API

### `actions`
An array where the values are either functions or objects.

__function__
```javascript
({ context, description, extension, hook, previousValue }) => (...args) => (previousValue) => { /* do stuff */ }
```

__object__
```javascript
{
  extension: 'roc-package-core-dev', // For which extension this action should run - optional
  hook: 'before-clean', // For which hook this action should run - optional
  action: () => () => () => { }, // A function following the same interface as the plain function
  post: () => () => () => { }, // A function following the same interface as the plain function and that runs last - optional
  description: 'Some __description__.' // A description on what it does, used for documentation generation and can use Markdown - optional
}
```

[Read more here.](/docs/Hooks.md#actions)

### `commands`
An object where the properties are either command groups or commands. A command can be either a function, a string or an object.

__Important!__
The property name `command` is reserved and should not be used as the name for a command group or command.

__Command Group__
An object that contains either command groups or commands.

__Command__
Either a string, a function or an object.

__Example__
```javascript
{
  commands: {
    lint: String / Function,
    development: {
      build: String / Function,
      dev: {
        command: String / Function,
        arguments: Object - optional,
        description: String - optional,
        help: String - optional,
        markdown: String - optional,
        options: Object - optional,
        settings: true / [Strings] - optional
      }
    }
  }
}
```

[Read more here.](/docs/Commands.md)

### `config`
An object that contains configuration. Allows the extension to define new configuration and modify things defined by others.

The core has knowledge about two properties on the object that are specially handled.

`project`
An object that contains project specific configuration that is managed by the core. Extensions should __not__ define this property.

`settings`
An object containing settings for Roc that is used by both extensions and projects.

Other than these two properties extensions are free to define other properties as needed. Note that `config` is to be used together with [`meta`](#meta) described below.

__Example__
```javascript
{
  config: {
    settings: {
      // ...
    },
    customProperty: () => {}
  }
}
```

[Read more here.](/docs/Configuration.md)

### `dependencies`
An object that supports three properties all related to dependencies.

[Read more here.](/docs/Runtime.md#dependency-managenent)

#### `exports`
Dependencies that the extension exports to other extensions and projects.

__Example__
```javascript
dependencies: {
  exports: {
    react: '~15.0.0'
    webpack: {
      version: '^1.12.0',
      resolve: ({ extensionContext, module, request, requestContext }) => path
    }
  }
}
```
_Tip:_ [Use `generateDependencies`](/docs/API.md#generatedependencies)

##### Custom resolve
By default extensions that are exported will be resolved in the extensions context, the location of the extension, but it is possible to provide a custom resolve function to override this. Can be used to replace one dependency with another for example, like changing all requests for `underscore` to `lodash`.

The custom resolve function gets an object as a argument and is expected to return a path that should be resolved.

__`extensionContext`__  
A string that is the context of the extension, the location on disk for the extension.

__`identifier`__  
A string that is used to identify the resolver instance. Examples are `Node` and `Webpack`.

__`module`__  
A string, the module that Roc is trying to find. Will most often be the same as the property defined in the `exports` object.

__`request`__  
A string, the path that was requested.

__`requestContext`__  
A string, the location of the request. The path to the directory from which the request was performed.

#### `requires`
Dependencies that are required and will be verified to exist by Roc.

__Example__
```javascript
dependencies: {
  requires: {
    react: '~15.0.0'
  }
}
```

#### `uses`
The dependencies that the extension uses internally, for documentation purposes.

__Example__
```javascript
dependencies: {
  uses: {
    react: '~15.0.0'
  }
}
```
_Tip:_ [Use `generateDependencies`](/docs/API.md#generatedependencies)

### `description`
Either a string or a function that will be used as the description for the extension. Roc will use the `description` from the `package.json` of the extension if none is provided

Supports markdown.

__function__

```javascript
(commandObject, extension) => string
```

`commandObject`
[The command object that is used inside Roc.](/docs/Commands.md#command-object)

`extension`
A boolean that is true when the description is to be used for an extension.


### `hooks`
An array with objects that define hooks.

__Example__
```javascript
{
  'babel-load-presets': { // The name of the hook, important as this is used by actions
    description: 'Expected to return a presets to add to the array of presets to use.', // A description on what it does, used for documentation generation and can use Markdown - optional
    hasCallback: true, // If it uses a callback - optional
    initialValue: [], // The initial value - optional
    returns: isArrayOrSingle(isString), // What it expects to get after all the actions has been processed, used for validation and for documentation - optional
    arguments: { // The arguments that the hook will call the actions with - optional
      target: { // The name of the argument
        validator: isString, // The validation for the argument
        description: 'Lorem bacon' // A description
      }
    }
  }
}
```

[Read more here.](/docs/Hooks.md#hooks)

### `init`
A function that can be used to programmatically define values that should be used instead of what is already defined on the Roc object and override things from the built context.  

__Example__
```javascript
({ context, localDependecies }) => {}
```

__`context`__  
The [context object](/docs/Context.md) so far.

__`localDependecies`__  
An object with the dependencies for the extension itself.

#### Return value
The function can either return a valid result or an error.

__Error__  
If the function returns `false` or a string it will be considered an error. This can be useful if some expected value was not present for example. The extension will in that case not be processed further and will not be added to the context.

__Valid__  
An object will be considered valid and can both override properties from the extensions Roc object and update the present context.

__Example__
```javascript
{
  roc: {
    actions,
    commands,
    config,
    dependencies,
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
Will be merged with the values already present directly on the Roc object with the values from the init function overwriting.

Supports specifying:
- actions
- commands
- config
- dependencies
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

Dependencies will be used for both the project and the extension itself.

_Note:_ `hooks` are not present in the `context` object. This since it would not make sense to remove registered hooks from other extensions.

### `meta`
The Roc meta configuration object.

__Example__
```javascript
config: {
  settings: {
    // ...
  },
  customProperty: {
    description: 'Some description'
  }
}
```

[See more here.](/docs/Configuration.md#meta-configuration)

### `name`
A string that notes the name of the extension. Required, but Roc will use the `name` from the `package.json` of the extension if none is provided

### `packages`
An array of file paths that point to packages that the extension uses. Will be used by Roc when building the complete context.

__Example__
```javascript
[
  require.resolve('roc-package-core-dev'),
  require.resolve('roc-package-module')
]
```

### `plugins`
An array of file paths that point to plugins that the extension uses. Will be used by Roc when building the complete context.

__Example__
```javascript
[
  require.resolve('roc-plugin-start'),
  require.resolve('roc-plugin-browsersync')
]
```

### `postInit`
Can be used update the state after all other extensions have been initialized. Has the almost the same interface as [`init`](#init), with the exception that dependencies are not managed and that it can't return an error.

__Example__
```javascript
({ context, localDependecies }) => {}
```

__`context`__  
The [context object](/docs/Context.md) so far.

__`localDependecies`__  
An object with the dependencies for the extension itself.

#### Return value
Should return an object with the structure below, can both override properties from the extensions Roc object and update the present context. Can also return `false` if nothing should be processed.

__Example__  
```javascript
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
    meta
  }
}
```

__`roc`__  
Will be merged with the values already present directly on the Roc object with the values from the init function overwriting.

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
- meta

_Note:_ `hooks` are not present in the `context` object. This since it would not make sense to remove registered hooks from other extensions.

_Note:_ `dependencies` are not present. This since it would be to late to change them at this time.

### `required`
An object listing required extensions and what version that are considered valid. Uses the same [semver parser](https://www.npmjs.com/package/semver) that is used by npm.

Also `roc` can be checked, this will be the instance that started the runtime and not the dependency that the extension itself might have.

__Example__
```javascript
{
  roc: '^1.0.0',
  'roc-package-web-app': '~2.1.0',
  ...
}
```

### `standalone`
A boolean that defaults to `false` that informs Roc if the extension should be managed as a standalone extension or not.

Roc will by default try to find an extensions `package.json` by searching recursively upwards from the main file until it finds one or fails. This will not work in all situations, for example when a custom extension has been created without a `package.json`.

This means that Roc will not be able to find `name` and `version` from the `package.json` resulting in that they have to be defined when setting this to `true`. Additionally if a `description` is desired this will also need to be defined for the same reason, Roc can’t take it from the `package.json` automatically.

### `version`
A string that notes the version of the extension. Required, but Roc will use the `version` from the `package.json` of the extension if none is provided.

## What is considered a valid object
For a Roc object in an extension to be considered valid it needs to have at least a `name`, a `version` and one more property.

There is however an exception to this, abstract extensions. They just need `name` and `version` to be valid.

Even though `name` and `version` are mandatory you will not need to define them in most cases since Roc will read them from the extension’s `package.json` if one exists.

## Tip for optimal performance
Requiring modules in Node can be quite slow and might have a negative impact on initial startup if not managed correctly. A normal way to structure extensions is to move the functions that are used in the Roc object to other files and then import them. This is the case for actions, hooks and commands primarily.

We recommend to make all of these requires/imports lazy for the best possible performance. Roc provides a helper function to make this as easy as possible in extensions, `lazyFunctionRequire`. It expects that the file that is imported exports a single function as its default export.

__Do not do this__
```javascript
import myAction from './myAction';

roc = {
  actions: [{
    action: myAction
  }]
}
```

__Do this__
```javascript
import { lazyFunctionRequire } from 'roc';

const lazyRequire = lazyFunctionRequire(require);

roc = {
  actions: [{
    action: lazyRequire('./myAction')
  }]
}
```

Another advantage of doing this is that the code that will be loaded using `lazyFunctionRequire` will be loaded after the runtime has started. This results in  `import`s / `require`s can be done on things that other extensions have exported.
