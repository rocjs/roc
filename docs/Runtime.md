# Runtime
Roc features a runtime that drives extensions allowing them to do powerful things like providing configuration and dependency management. This runtime is by default needed when running the projects in both development and production mode. It’s automatically added whenever using the command line interface and if one wants it’s also possible to manually add the runtime and even remove the need for it altogether in some cases.

The runtime consist of several smaller parts, mainly:

- Dependency management
- Configuration management
-  Action & Hook management

For projects that are running in production it’s mainly the dependency management that is interesting and sometimes the configuration management as well.

## Projects
From a project perspective it can be good to understand how the runtime functions to minimise the amount of magic that it can feel Roc provides.

### Dependency management
Extensions can provide dependencies for projects that makes it possible to use them directly in the code without needing to install them manually. For example can an extension provide a version of React that the project can use as it where added to the projects `package.json` directly. This means that extensions can do some of the heavy lifting when it comes to managing dependencies making sure that everything works together.

Extensions also have ways to inform projects what dependencies they use internally as well as requiring some things to be installed in the project.

The best way to get a overview of this in a project is to use the documentation command: `roc meta docs`. From this a file will be generated that describes everything about the dependencies for the current project. Mainly it will feature three sections that matches the following three sections.  

#### Exports
This is the most powerful aspect of Roc’s dependency management. The documentation will list all the different dependencies that extensions have exported for other extensions and project to use.

What this means is that an extension can export a dependency like React that a project can use without having to install it manually in the project. The extensions takes care of the dependency making sure it works with everything else along with potential boilerplate code.

This requires no special API and an import is done in the same way as one would do it if the dependency was installed directly in the project.

```javascript
// ES2015 Module syntax
import React from 'react';

// CommonJS Module syntax
var React = require('react');
```

It is possible to override the provided version if needed. Most of the time this will should not be done.

```javascript
// Will use the react that has been installed in
// the projects package.json and not the exported
import React from '#react';
var React = require('#react');
```

#### Uses
This will be all the different dependencies that extensions has listed as something they use and with what version range. This is useful to easily and quickly get an understanding about what the internal dependencies of some extensions are.

#### Requires
This will list all the different dependencies that extensions requires to be installed in the project before starting or doing anything. This can be seen as a variant of [peerDependencies](https://docs.npmjs.com/files/package.json#peerdependencies).

This will be verified when starting the runtime.

### Manually adding the runtime
The runtime will always be added automatically when using the CLI. There might be situations where a need to manually add the runtime arrises and it is of course possible to do.

```javascript
// Default options
const optionalOptions = {
  verbose: true,
  directory: process.cwd(),
  projectConfigPath: undefined
};

require('roc').runtime(optionalOptions);
```

Can also be included from `roc/runtime` and for just using the default options directly one can use `roc/runtime/register`.

```javascript
// ES5
require('roc/runtime/register');

// ES6
import 'roc/runtime/register';
```

__options__
```
verbose             If the runtime should start in verbose mode
directory           The directory that the runtime should start in, default is the current working directory    
projectConfigPath   The path to the configuration file, same as --config when using the CLI
```

## Get access to the resolver
When the runtime has been configured it is possible to get the resolver that Roc uses internally as can be seen below.

```javascript
import { getResolveRequest } from 'roc';

// resolver: (module, context, fallback) => path
const resolver = getResolveRequest('Identifier');
```
When the runtime has been configured it is possible to get the resolver that Roc uses internally. Using this resolver will resolve in the same way Roc does. Node’s require will by default be patched and this function can be used to add support for other things like Webpack.

### `resolver`
The resolver that is returned from `getResolveRequest` has the following arguments.

__`module`__  
The module that is requested, what typically would be X in `require(X)`.

__`context`__  
The context from where the request was done, the file that did the request.

__`fallback`__  
An optional boolean that enables fallback mode, should only be used if the first request failed.

This emulates kinda how `NODE_PATH` works in that we try again with another scope. What this does is that it uses the context of dependencies for the extension that a dependency is installed in to manage possible failures. This is needed if a dependency of an extension requires some peerDependency that some other extension is providing.

## Dependency strategies
An important part of Roc extensions is how they manage dependencies. This since they often take responsibility for dependencies that otherwise would have been managed by the project itself. This holds true for all of the three types of managed dependencies in Roc: `uses`, `requires` and `exports`.

A recommendation is to use `^` in most cases to allow projects to get the latest features as soon as possible without needing to wait for a new version of an extension. However as always with SemVer it’s important that this is done with care and it might not be a perfect match in all cases.

For example might it be better to actually lock all the dependencies if it is possible to release often and always stay on top of all the dependencies. This would allow the users to get the latest features while still being able to trust the extension to manage the dependencies correctly. This would also allow the extension to correctly expose new features to users without needing to use escape hatches or similar.

A good middle way solution can be to use `~` that will allow for some updates but all features will be manually managed.

## How can I start my Roc application without using the roc CLI?
There is mainly two alternatives when wanting to start a Roc application without using its CLI.

### Start the application using the command line script manually
This is probably the easiest way of doing it with the least risk for mistakes.

```bash
node node_modules/.bin/roc start
```
_Inside the application root_

### Using a custom entry point
If a little more control is desired one can start the the application using a custom entry point that adds the runtime as described above to the top of the entry file.

```javascript
require('roc/runtime/register');

// ... rest of the code
```
