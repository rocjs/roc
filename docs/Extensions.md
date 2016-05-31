# Extensions

Extensions are a really important part of Roc that makes building applications possible. They are responsible for adding different libraries, frameworks and logic to the application. Extensions come in two types, Packages and Plugins. They are similar in a lot of ways, see below for more details.

## Packages
Packages are the main building blocks for applications and will most often consist of two parts, a development package and a non-development package. Together they create something that can be used directly in a project and this is the difference from plugins. From a technical standpoint they are almost identical.

## Plugins
Plugins are often smaller packages that are NOT to be used directly in a project but in conjunction with a package to add some additional functionality.

## Abstract Extensions
Abstract extensions are not meant to be used directly inside a user project but rather to enhance and define something that other extensions can build on. They are from a technical standpoint identical to their non abstract counterparts. The only difference is the naming convention where `roc-abstract-*` is used over either `roc-package-*` or `roc-plugin-*`. It's up to the developer to select a fitting name for an abstract package that fits the naming convention. For an abstract package that might be `roc-abstract-package-*` and for an abstract plugin `roc-abstract-plugin-*`.

The naming convention serves two purposes. Firstly it makes it clear for everyone that it's something to only use inside other extensions. Secondly it makes Roc ignore them if present inside a user projects `package.json`. If the user however wants to use one inside the project he can still add it to the `packages` or `plugins` properties inside the `roc.config.js` file.

## General Structure
Roc expects all extensions to export an object named `roc` from the main file in a npm package. Other than this the packages themselves are quite free to do whatever they want to create what is needed to build an application.

It must contain at least one of the following:
```
packages        Array of packages that the extension inherits from
plugins         Array of plugins that the extension inherits from

init            A function will initialize the extension
postInit        A function that will run after all extensions have been initialized in the reverse order as they were added

buildConfig     Function that takes the previous configuration and meta objects and returns new ones
config          Configuration object
meta            Meta configuration object
actions         An object with actions that should connect to the hooks
hooks           An object with the hooks that a package uses, not needed but useful for documentation and convenience
```
__If `buildConfig` is specified, config and meta will be ignored.__  
__If `init` is specified, `buildConfig`, `config`, `meta`, `actions` and `hooks` will be ignored.__

You can also optionally define name and version. If not provided they will be taken from `package.json` if one exists.
```
name            The name of the extension
version         The version for the extension
```

#### packages
An array of Roc packages that the extension uses. Classically this will look like this:
```
packages: [
    require.resolve('roc-package-core-dev'),
    require.resolve('roc-package-module')
]
```

#### plugins
An array of plugins that the extension uses. Classically this will look like this:
```
plugins: [
    require.resolve('roc-plugin-start'),
]
```

#### init
Can be used to initialize the extension. Will get the following as an object:
```
config          The configuration object at this time
meta            The meta configuration object at this time
extensions      The registered extensions at this time, is an array with the following structure: [{name, version}]
actions         The registered actions at this time
hooks           The registered hooks at this time
```
If the extension should be processed the function needs to return an object that can have one of the following from [above](#general-structure); `buildConfig`, `config`, `meta`, `actions` and `hooks`. If the function returns nothing/undefined it will be managed as an error and the extension and all that depends on it will not be loaded. This is also the case if it returns a string, the string can be used for a more detailed error message.

_This will soon be the only way for an extension to remove actions & hooks_

#### postInit
Can be used update the state after all other extensions have been initialized. Will get the following as an object:
```
config          The configuration object at this time
meta            The meta configuration object at this time
extensions      The registered extensions at this time, is an array with the following structure: [{name, version}]
actions         The registered actions at this time
hooks           The registered hooks at this time
```

_This will soon be the only way for an extension to remove actions & hooks_

#### config
The Roc configuration object.

#### meta
The Roc meta configuration object.

#### buildConfig
Function that takes the previous configuration and returns the new one.

```javascript
(config = {}, meta = {}) => {
    // Do something
    return {
        config: newConfig,
        meta: newMeta
    }
}
```

#### hooks
Hooks are integration points where other extensions (or the extension itself) can run code. Used for running side effects like starting Browsersync or return some state; like for example redefining what plugins to use with Babel.

Extensions can run hooks without declaring them in the configuration using this property, but when doing so they will not get the documentation generation and a helper function for easier management of hooks in the code.

An example of this hooks object:
```javascript
{
    'babel-load-presets': { // The name of the hook, important as this is used by actions
        description: 'Expected to return a presets to add to the array of presets to use.', // A description on what it does, used for documentation generation and can use Markdown - optional
        hasCallback: true, // If it uses a callback - optional
        initialValue: [], // The initial value - optional
        returns: isArrayOrSingle(isString), // What it expects to get after all the actions has been processed, used for validation and for documentation - optional
        arguments: [{ // The arguments that the hook will call the actions with - optional
            name: 'target', // The name of the argument
            validation: isString, // The validation for the argument
            description: 'Lorem bacon' // A description
        }]
    },

    'babel-load-plugins': {
        description: 'Expected to return a concatenated array with the final presets to use.', // A description on what it does, used for documentation generation and can use Markdown
        initialValue: [], //
        returns: isArray(isString),
        arguments: [{
            name: 'target',
            validation: isString,
            description: 'Lorem bacon'
        }]
    }
}

```
#### actions
Actions connect to hooks. They provide an easy way to override behavior. It's also possible to register directly with `roc` using `registerAction` but most often it will be easier to use them directly instead.

Actions are expected to be an object that where the values are either functions or objects. If it is a function that will be used directly but if it's an object some additional possibilities are provided.

An example of this actions object can be seen here:
```javascript
{
    someAction: () => () => () => { /* A function */ },
    otherAction: { // The name of the action is used for documentation and logging
        extension: 'roc-package-core-dev', // For which extension this action should run - optional
        hook: 'before-clean', // For which hook this action should run - optional
        action: () => () => () => { /* A function */ }, // A function following the same interface as the plain function
        description: 'Some __description__' // A description on what it does, used for documentation generation and can use Markdown - optional
    }
}
```

The action function interface is the following (as touched on above):
```javascript
({ extension, hook, previousValue, description, settings, verbose }) => (...args) => () => {}
```

```
extension           The calling extension name
hook                The calling hook name
previousValue       The previous value, will either be the initalValue defined for the hook or the return value from the action that run before the current one
description         The hook description, can be used for logging what the calling hook is supposed to do
settings            The settings from the Roc configuration object
config              The entire Roc configuration object
verbose             The verbose mode, either true or false
```

__The call chain__

1. The first function will normally be invoked for every single action for every single hook. In this case it is up to the action to determine if it should process this and in that case return a new function. If one has registered the action with `extension` and/or `hook`  it will only be called if these match.

2. The second function will be called with possible arguments and it might return another function if it should run.

3. The third function will be invoked and in some instances it might be expected that it returns a value, in others not.


## Default Hooks

Roc has one internal hook that can be used by extensions to modify the settings object before a command is started and after potential arguments from the command line and configuration file have been parsed. This is a good point to default to some value if no was given or modify something in the settings.

```
extension       roc
hook            update-settings
```

The action that integrates with this hook is expected to return a settings object that should be merged with the existing one.
