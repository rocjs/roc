# Extensions

Extensions are a really important part of Roc that makes building applications and modules possible. They are responsible for adding different libraries, frameworks and logic to projects. Extensions come in two types, __Packages__ & __Plugins__, and both of them can be abstract versions of themselves. They are similar in a lot of ways with the largest difference for how they are to be used with a project.

## Types

### Packages
Packages are the main building blocks for projects and will most often consist of two parts, __a development package__ and a __non-development package__. Together they create something that acts as the foundation for the project and most projects will use a single package. 

A Roc project needs to use at least one package to be considered valid. From a technical standpoint they are almost identical to plugins, the difference is in how they are supposed to be used.

### Plugins
Plugins are often smaller than packages and are __not__ to be used alone in a project but in together with some package to add some additional functionality to the project.

### Abstract Extensions
Abstract extensions are not meant to be used directly inside a project but rather to enhance and define something that other extensions can build on. They are from a technical standpoint identical to their non abstract counterparts. The only difference is the naming convention where `roc-abstract-*` is used over either `roc-package-*` or `roc-plugin-*`. It’s up to the developer to select a fitting name for an abstract package that fits the naming convention. For an abstract package that might be `roc-abstract-package-*` and for an abstract plugin `roc-abstract-plugin-*`.

The naming convention serves two purposes. Firstly it makes it clear for everyone that it's something to only use inside other extensions. Secondly it makes Roc ignore them if present inside a user projects `package.json`. If the user however wants to use one inside the project he can still add it to the [`packages` or `plugins` properties inside the projects `package.json`](#).

### Development Extensions
As mentioned above packages often come in both a development package and a non-development package, this can also be the case for some plugins. These development packages should be named the same as the non-development version with the addition of a `-dev` prefix.

For example would a development version of `roc-package-web-app` be `roc-package-web-app-dev`. This mainly makes it possible to have the non-development extension in the normal `dependencies` and the development extension in `devDependencies` allowing projects to only install what they need for a given situation. 

The naming difference also has a technical implication. When Roc is loading extensions it will manage development ones in a specific way in regards too the dependencies that they might export from their Roc object. This to make sure that the non-development extension always will have access to what its development partner exports.

## API
For something to be considered a valid Roc extension it will need to export an object named `roc` from its main file. Other than this the extensions are free to export additional things along side it.

The Roc object, `roc`, is the API that the extensions use to define things like new commands, settings, hooks and much more.

[See here for the Roc object documentation.](/docs/RocObject.md)