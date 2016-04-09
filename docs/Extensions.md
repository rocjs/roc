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

The object must contain a name (most likely the same as the `name` defined in `package.json`) and at least one of the following:
```
buildConfig     Function that takes the previous configuration and meta objects and returns new ones
--- OR ---
config          Configuration object
meta            Meta configuration object

actions         An object with actions that should connect to the hooks
hooks           An object with the hooks that a package uses, not needed but useful for documentation and convenience
packages        Array of packages that the extension inherits from
plugins         Array of plugins that the extension inherits from
```
__If `buildConfig` is specified, config and meta will be ignored.__

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
    someAction: () => () => () => () => { /* A function */ },
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
(registeredHooks, registeredActions) => ({ extension, name, previousValue, description, settings, verbose }) => (...args) => () => {}
```

```
registeredHooks     The registered hooks at the point when the action is instantiated, an object where the extension name is the key (Important to know that hooks might be added afterwards or added in a way where they are not registered in this way)
registeredActions   The registered actions at the point when the action is instantiated, an array that contains objects `{ name, actions }` where name is the name of the extension and actions the actions as above
```

```
extension           The calling extension name
hook                The calling hook name
previousValue       The previous value, will either be the initalValue defined for the hook or the return value from the action that run before the current one
description         The hook description, can be used for logging what the calling hook is supposed to do
settings            The settings from the Roc configuration object
verbose             The verbose mode, either true or false
```

__The call chain__

1. The first function in the chain is run when the action is registering itself with Roc. Here it's possible to validate that the right hooks or actions are present and it's also possible to remove some of them using `removeActions` if they are not supposed to run.

2. The second function will normally be invoked for every single action for every single hook. In this case it is up to the action to determine if it should process this and in that case return a new function. If one has registered the action with `extension` and/or `hook`  it will only be called if these match.

3. The third function will be called with possible arguments and it might return another function if it should run.

4. The fourth function will be invoked and in some instances it might be expected that it returns a value, in others not.



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

## Default Hooks

Roc has one internal hook that can be used by extensions to modify the settings object before a command is started and after potential arguments from the command line and configuration file have been parsed. This is a good point to default to some value if no was given or modify something in the settings.

```
extension       roc
hook            update-settings
```

The action that integrates with this hook is expected to return a settings object that should be merged with the existing one.
