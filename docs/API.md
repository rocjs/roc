# API Reference

This document outlines all the named exports form the main file in Roc. This means that these functions can be considered part of the public API and can be consumed in the following way.

```javscript
// ES5
var merge = require('roc').merge;

// ES6
import { merge } from 'roc';
```

* Utilities
    * [defaultPrompt](#)
    * [fileExists](#)
    * [folderExists](#)
    * [generateDependencies](#)
    * [getAbsolutePath](#)
    * [lazyFunctionRequire](#)
    * [merge](#)
* Execute
    * [execute](#)
    * [executeSync](#)
    * [executeSyncExit](#)
* Configuration
    * [appendConfig](#)
    * [appendSettings](#)
    * [getConfig](#)
    * [getSettings](#)
* Runtime
    * [getResolveRequest](#)
    * [initRuntime](#)
* Hooks
    * [removeActions](#)
    * [runHook](#)
    * [runHookDirectly](#)
* Others
    * [initLog](#)
    * [runCli](#)

## Utilities
These are utility functions that might be useful in mainly extensions.

### `defaultPrompt`
The default prompt that will be shown when using a template if not one is specified from the template, is an array. Can be used to extend the prompt.

[See template documentation for more information.](/docs/Templates.md)

### `fileExists`
```javascript
import { fileExists } from 'roc';

if (fileExists(path, /* directory */)) {
    // file exist
} else {
    // file does not exist
}
```
Verifies if a file exists. Directory is optional and the path will be made absolute using `getAbsolutePath` meaning that it can be relative.

### `folderExists`
```javascript
import { folderExists } from 'roc';

if (folderExists(path, /* directory */) {
    // folder exist
} else {
    // folder does not exist
}
```
Verifies if a folder exists. Directory is optional and the path will be made absolute using `getAbsolutePath` meaning that it can be relative.

### `generateDependencies`
```javascript
import { generateDependencies } from 'roc';

// To be used inside the Roc object for dependencies.exports and dependencies.uses
export default {
  dependencies: {
    exports: generateDependencies(require('package.json'), [
        'lodash',
        'webpack'
    ]),
    uses: generateDependencies(require('package.json'), [
        'left-pad'
    ])
  }
};
```
To be used when defining dependencies that are either exported or used in an extension. Makes it easier to define the needed data without having to do a lot of manual work.

### `getAbsolutePath`
```javascript
import { getAbsolutePath } from 'roc';

const absPath = getAbsolutePath('./some/path', /* directory */);
```
Makes a path absolute if not already. Takes in a optional directory and will fallback on `process.cwd()`. Will return `undefined` if no path is given.

### `lazyFunctionRequire`
```javascript
import { lazyFunctionRequire } from 'roc';

const lazyRequire = lazyFunctionRequire(require);

roc = {
  actions: [{
    action: lazyRequire('./myAction')
  }]
}
```
Will delay the require of a file that exports a function until it is requested. Recommended to use as a way to speed up loading extensions.

### `merge`
```javascript
import { merge } from 'roc';

const newObject = merge(objA, objB);
```
Will deeply merge two objects together and return a new object.

## `Execute`
__These functions should be seen as experimental and might change without a mayor version change to Roc.__

Roc has a simple implementation of execute that makes it easy to invoke string commands as they would have been invoked through a npm script. Does not currently automatically bind `node_modules` to the _PATH_ meaning that correct paths needs to be used. Not a complete mapping to the shell, supports `&`, `&&` for running commands in sequence and `cd`.

### `execute`
```javascript
import { execute } from 'roc';

execute('git log')
  .then(() => {
    // Completed
  })
  .catch((exitStatus) => {
	  // A problem happened, status from the process available
  });
```
Runs a string in the shell asynchronous and returns a promise that resolves when the command is completed or when a error happened.

### `executeSync`
```javascript
import { executeSync } from 'roc';

// Will no print anything to console, result available in return value
const output = executeSync('git log', true);

// Will print to console
executeSync('git log');
```
Runs a string in the shell synchronous. If running in silent mode, the second argument set to true, the function will return the output.

The function will throw if an error happens. The error object will be extended with the following extra properties.

```
error.command - The command that was used that caused the problem
error.arguments - The arguments that where used that caused the problem
error.exitStatus - The status from the process
error.stderr - The result from stderr
error.stdout - The result from stdout
```

### `executeSyncExit`
```javascript
import { executeSyncExit } from 'roc';

// Will no print anything to console, result available in return value
const output = executeSyncExit('git log', true);

// Will print to console
executeSyncExit('git log');
```

A wrapper around `executeSync` with the difference that it will terminate the process if an error happens with the same status.

## Configuration

### `appendConfig`
```javascript
import { appendConfig } from 'roc';

const customConfig = {
    property: 'value'
};

const config = appendConfig(customConfig);
```
Appends new configuration to the configuration object after the context has been built.

### `appendSettings`
```javascript
import { appendSettings } from 'roc';

const newSettings = {
    runtime: {
	    port: 80
    }
};

const settings = appendSettings(newSettings);
```
Appends new settings to the settings object after the context has been built.

### `getConfig`
```javascript
import { getConfig } from 'roc';

const config = getConfig();
```
Gets the configuration.

### `getSettings`
```javascript
import { getSettings } from 'roc';

const settings = getSettings();
const runtimeSettings = getSettings('runtime');
```
Gets the settings, possible to specify the first group to select a slice.

## Runtime

### `getResolveRequest`
```javascript
import { getResolveRequest } from 'roc';

// resolver: (module, context) => path
const resolver = getResolveRequest('Identifier');
```
When the runtime has been configured it is possible to get the resolver that Roc uses internally. Using this resolver will resolve in the same way Roc does. Node’s require will by default be patched and this function can be used to add support for other things like Webpack.

### `initRuntime`
```javascript
// Default options
const optionalOptions = {
  verbose: true,
  directory: process.cwd(),
  projectConfigPath: undefined
};

require('roc').runtime(optionalOptions);
```
Used to manually add the Roc runtime. Can also be included from `roc/runtime` and for just using the default options directly one can use `roc/runtime/register`. [See more here.](/docs/Runtime.md#manually-adding-the-runtime)

## Hooks

### `removeActions`
```javascript
import { removeActions } from 'roc';

const newActions = removeActions(actions)('roc-package-example', /* hookName*/);
```
Remove actions from a given state, useful in `init` and `postInit` to remove actions that should no longer run. The first argument on the second function is for what extension to remove the actions for and the second for what hook the actions are connected to.

### `runHook`
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
Runs a hook that have been registered with Roc, often wrapped in extensions as seen above.

### `runHookDirectly`
```javascript
import { runHookDirectly } from 'roc';

runHookDirectly(meta, args, callback);
```
Runs a hook directly, without having to register it first with Roc.

__meta__
An object with meta data for the hook, [see hooks documentation for more info.](#)
```
arguments - Arguments definitions
description - A description for what the hook does
extension - For what extension the hook is connected to
initialValue - The initial value for the hook invocation
name - The name of the hook
returns - The validation for the return value from the actions
```

__args__
The arguments that should be sent to the actions.

__callback__
The callback that should be invoked after the action returns.

## Others

### `initLog`
```javascript
import { initLog } from 'roc';

// name and version should be for current extension
const largeLog = initLog.large(name, version);
const smallLog = initLog.small();

largeLog.info(message, title);
smallLog.warn(message);
```
Roc exports a logging function that prints to the stdout that can be used in extensions to normalise the output from them with additional benefits like supporting verbose mode.

Can also be imported directly from `roc/log`.

```javascript
import initSmall from 'roc/log/small';
import initLarge from 'roc/log/large';
import initLog from 'roc/log';

import smallDefault from 'roc/log/default/small';
import largeDefault from 'roc/log/default/large';
import initLogDefault from 'roc/log/default';
```

[See logging documentation for all the possible types of messages.](#)

### `runCli`
```javascript
import { runCli } from 'roc';

runCli({ info, commands, args, invoke });
```
Be able to invoke the CLI manually. Can be used to create wrappers around the default `roc` CLI and build the same context as was created by Roc with the parsed arguments using invoke as `false`.

__`info`__
An object that has two properties, `name` and `version`. Should hold the name and the version for the current CLI. Will default to `Unknown` for both.

__`commands`__
An object with commands that should be used as a base, before additional commands are added from extensions or the default commands that are added if it’s a valid Roc project.

__`args`__
An array with arguments, will default to `process.argv`.

__`invoke`__
A boolean that is used to determine ff a command should be invoked after the context has been built or not. Default to `true`.
