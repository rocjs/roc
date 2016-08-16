# Introduction

Roc is a tool that assists in creating and managing JavaScript projects. It has the ambitious goal of making it easier to work with modern web development, that at times can be quite complex and require a lot of tooling and configuration to get started.

The core of Roc (this project) aims to be as agnostic as possible and instead uses opinionated [extensions](#extensions) to provide different frameworks and libraries along with [templates](#templates) for easy and predictable initial setup. When putting all of this together you get an ecosystem that enables developers to focus on writing great software and away from tooling and juggling boilerplates that degrade over time.

By design it will in most cases be trivial to migrate away from or to Roc _(based on individual extensions)_ because the code you write is the same code you would write without it; just with less boilerplate, setup and dependency management.

__Why Roc?__
- Get started quickly and easily
- Possible to update projects after initial setup
- Unopinionated, allowing for a wide range of different types of projects
- Composable, easy to add and remove functionality
- Modular, easy to create custom packages & plugins for specific needs

## Overview
You can see Roc as mainly four separate things that work together.

![overview](/docs/assets/overview.png)

You do not need to understand how everything is connected if you only want to create a project using existing templates and extensions, something that will be the case in most situations. However a short overview of what the different parts do is great for an understanding of how Roc functions and where to look if a problem occurs.

### Core
The core of Roc, often referred to as `roc` from the command line interface, serves multiple purposes in the ecosystem and will mainly manage the following things.

![core](/docs/assets/core.png)

#### Command Line Management
Roc features a powerful and dynamic command line interface that will feature different commands depending on the context from which it is invoked.

[Read more here for the CLI in general](/docs/CLI.md) and [here for how commands work](/docs/Commands.md).

#### Configuration Management
Roc features a configuration system that makes it possible for extensions and projects to configure things to a high degree.

[See here for information about the general configuration](/docs/Configuration.md) and [here for information about the settings system](/docs/Settings.md).

#### Documentation Generation
An important part of Roc is documentation generation and is used both by extensions and user projects.

[Read more here.](/docs/DocumentationGeneration.md)

#### Hook Runtime
Roc uses a hook system to extend and modify functionality in extensions.

[Read more here.](/docs/Hooks.md)

#### Runtime management
Manages a runtime that drives extensions allowing them to do powerful things like providing configuration and dependency management.

[Read more here.](/docs/Runtime.md)

### Extensions
![extensions](/docs/assets/extensions.png)

Extensions are typically opinionated modules that add code and configuration needed to build a project as well as some boilerplate code in some instances. They come in two forms, __packages__ and __plugins__.

A user project can use multiple extensions that together composes everything needed for the project. That is build management, testing, project code, commands and much more.

By design most extensions will try to be out of the developers way as much as possible and should in most cases not introduce anything specific to Roc that needs to be considered when writing code. This makes it easier to learn and also migrate away from or to Roc.

[Read more here.](/docs/Extensions.md)

### Projects
Projects are the consumers of extensions and will typically be applications, components and modules. They will often be instantiated from templates that will use a specific set of extensions for some predefined purpose.

When working with projects one does not need to know how everything in Roc is connected and the introduction here serves as a good basis.

[Read more here.](/docs/Projects.md)

### Templates
All code needed to create projects can't be managed by extensions alone and that is where templates come into the picture. Templates can be used to quickly bootstrap new projects with a skeleton tuned to work with a specific set of extensions.

It's easy to create new templates and use them instead of the existing ones. Templates are typically very small compared to other forms of boilerplates/starter kits.

[Read more here.](/docs/Templates.md)
