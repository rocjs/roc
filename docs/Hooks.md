# Hook system
Roc features a hook system that allows extensions to create hooks that other extensions, and themselves, can register against using actions. Projects also have the possibility to register to hooks if needed using their configuration file, [see more here](/docs/Configuration.md#actions).

## Hooks
Hooks can be seen as an event that actions can register themselves to, allowing them to return something back to the hook, like redefining what plugins to use with Babel, or run some side effect, like starting Browsersync.

### Running hooks
There exists two ways to run hooks in Roc. One where the hook needs to be registered before hand through the [Roc object](/docs/RocObject.md) and one where a hook is invoked directly. The registered method is the recommended one since that will allow Roc to generate documentation for the hook that will make it easier for developers to interact with it.

__Example__
```javascript
import { runHook, runHookDirectly } from 'roc';

// Run a hook without needing to define it in the extensions Roc object
runHookDirectly({
    arguments,
    description,
    extension,
    initialValue,
    name,
    returns
}, args, callback);

// Run registered hook with callback
runHook(extensionName)(name, ...args)(callback);

// Run registered hook without callback
runHook(extensionName)(name, ...args);
```

__Common way to use runHook in extensions__
```javascript
import { runHook } from 'roc';

const name = require('../../package.json').name;

// Can then be called in the extension like this
// invokeHook('hook-name', arg1, arg2, ...);
// invokeHook('hook-name', arg1, arg2, ...)(callback); - if callback
export function invokeHook(...args) {
    return runHook(name)(...args);
}
```

### Define hooks
It is easy to define hooks that can be registered with Roc through the [Roc object](/docs/RocObject.md#hooks).

__Example__
```javascript
{
    'babel-load-presets': { // The name of the hook, important as this is used by actions
        description: 'Expected to return a presets to add to the array of presets to use.', // A description on what it does, used for documentation generation and can use Markdown - optional
        hasCallback: true, // If it uses a callback - optional
        initialValue: [], // The initial value - optional
        returns: isArrayOrSingle(isString), // What it expects to get after all the actions has been processed, used for validation and for documentation - optional
        arguments: [{ // The arguments that the hook will call the actions with - optional
            name: 'target', // The name of the argument
            validator: isString, // The validator for the argument
            description: 'Lorem bacon' // A description
        }]
    },

    'babel-load-plugins': {
        description: 'Expected to return a concatenated array with the final presets to use.', // A description on what it does, used for documentation generation and can use Markdown
        initialValue: [], //
        returns: isArray(isString),
        arguments: [{
            description: 'Lorem bacon'
            name: 'target',
            validation: isString,
        }]
    },
}
```

#### `arguments`
An array of object that documents the arguments that the hook uses, what actions will be called with. The order is important and need match the order that is used when running the hook. Will bring better validation and documentation, optional.

__`description`__  
A string that describes what the argument is to be used for. Can contain markdown and will be used when generating documentation.

__`name`__  
A string that is the name for the argument. Will be used when generating documentation.

__`validation`__  
A validator function that will validate the argument that. Will also be used for the documentation generation.

#### `description`
A string that describes what the hook is for and how actions can interact with it. Will be used for the markdown documentation generation and can contain markdown.

#### `hasCallback`
A boolean that defines if the hook uses a callback. When set to `true` a callback is expected to be provided.

#### `initialValue`
The initial value for the hook. Hooks runs once for each action and each of them can return a value that the next action can access through a `previousValue` in the action signature. This value will be used the first time an action is called if defined, otherwise `undefined`.

#### `returns`
A validator function that checks the return value from the actions to make sure it is valid. Will also be used for documentation generation.

## Actions
Actions are functions that react to hooks and can both be generic, they run for all hooks that are invoked, or registered to a specific ones.

### Action signature
Actions are using call chain with three functions that each serve a specific purpose. This signature are used for all actions, both the ones that are registered as a plain function and those that uses an object.

```javascript
({ context, description, extension, hook, previousValue }) => (...args) => () => { /* do something */ }
```
__`context`__  
[The Roc context object.](/docs/Context.md)

__`description`__  
A string that is the hook description, can be used for logging what the calling hook is supposed to do.

__`extension`__  
A string that is the calling extension name.

__`hook`__  
A string that is the calling hook name.

__`previousValue`__  
The previous value, will either be the initalValue defined for the hook or the return value from the action that run before the current one

#### The call chain

1. The first function will normally be invoked for every single action for every single hook. In this case it is up to the action to determine if it should process this and in that case return a new function. If one has registered the action with `extension` and/or `hook`  it will only be called if these match.

2. The second function will be called with possible arguments and it might return another function if it should run.

3. The third function will be invoked and in some instances it might be expected that it returns a value, in others not.

### Define actions
Actions are used in both projects and extensions.

#### A function
In some cases it can be useful to create an action that reacts to all hooks and manually filter out the relevant ones. This can be done by conditionally return function for the first and the second step in the call chain.

__Example__
```javascript
({ hook }) => {
    if (hook === 'hook-name') {
        return (arg1) => {
            if (arg1 > 0) {
                return () => {
                    // Run the action
                }
            }
        }
    }
}
```

See above for the complete signature.

#### An object
An object can be used to register with a specific hook and/or belong to a specific extension.

__Example__
```javascript
{
  action: () => () => () => { },
  description: 'Some __description__.'
  extension: 'roc-package-core-dev', // For which extension this action should run - optional
  hook: 'before-clean', // For which hook this action should run - optional
  post: () => () => () => { }, // A function following the same interface as the plain function and that runs last - optional
}
```

__`action`__  
A function following the same interface as the plain function, required. See above for more details about the signature.

__`description`__  
An optional string with a description on what the action does, used for documentation generation and can use Markdown.

__`extension`__  
An optional string for which extension the action should run.

__`hook`__  
An optional string for which hook the action should run.

__`post`__  
An optional function following the same interface as the plain function. Will run after all the normal actions has been invoked. Can be used to do something after normal actions has been completed.

An example would be a action that is used to build a Webpack configuration object. A post action could then be responsible for reading something from the `roc.config.js` inside the project after everything else, making sure that it will be added on top of eveything else.

#### Add in extensions
Actions are registered using the [Roc object](/docs/RocObject.md#actions) and can be both defined as generic functions that are invoked for all actions and objects that connect to specific hooks.

#### Add in projects
Actions in projects can be added using the [`project.actions` in `roc.config.js`](/docs/Configuration.md#actions).
