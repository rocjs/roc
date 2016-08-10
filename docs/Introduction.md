# Introduction

Roc is a tool that assists in creating and managing JavaScript projects. It has the ambitious goal of making it easier to work with modern web development, that at times can be quite complex and require a lot of tooling and configuration to get started.

The core of Roc (this project) aims to be as agnostic as possible and instead uses opinionated [extensions](#extensions) to provide different frameworks and libraries along with [templates](#templates) for easy and predictable initial setup. When putting all of this together you get an ecosystem that enables developers to focus on writing great software and away from tooling and juggling boilerplates that degrade over time.

By design it will in most cases be trivial to migrate away from or to Roc _(based on individual extensions)_ because the code you write is the same code you would write without it; just with less boilerplate, setup and dependency management.

## Overview
You can see Roc as mainly four separate things that work together.

- The core, this project and often referred to as `roc`
- Extensions
- Templates
- User Projects

![overview](/docs/assets/overview.png)

You do not need to understand how everything is connected if you only want to create a project using existing templates and extensions, something that will be the case in most situations. However a short overview of what the different parts do is great for an understanding of how Roc functions and where to look if a problem occurs.

### Core
The core of Roc, often referred to as `roc` from the command line interface, serves multiple purposes in the ecosystem and will mainly manage the following things.

#### Runtime management
Manages a runtime that drives extensions allowing them to do powerful things like providing configuration and dependency management.

[Read more here.](/docs/Runtime.md)

#### Documentation Generation
An important part of Roc is documentation generation and is used both by extensions and user projects. 

[Read more here.](/docs/DocumentationGeneration.md)

#### Configuration Management
Roc features a configuration system that makes it possible for extensions and projects to configure things to a high degree.

[Read more here.](/docs/Configuration.md)

#### Hook Runtime
Roc uses a hook system to extend and modify functionality in extensions.

[Read more here.](/docs/Configuration.md)

#### CLI Management
Roc features a powerful and dynamic command line interface that will feature different commands depending on the context from which it is invoked. 

[Read more here.](/docs/Commands)

### Extensions
Extensions are opinionated modules that add code and configuration needed to build a project as well as some application code in some instances to make it easier to write applications and remove boilerplate. They come in two forms, packages and plugins.

A Roc application can use multiple extensions that together composes everything needed to create an application. That is both build management, testing, application code, CLI commands and much more.

By design most extensions will try to be out of the developers way as much as possible and should in most cases not introduce anything specific to Roc. This makes it easier to learn and also migrate away from or to Roc.

[Read more here.](/docs/Extensions.md)

### Templates
All code needed to create applications can't be managed by extensions alone and that is where templates come into the picture. Templates can be used to quickly bootstrap new projects with a skeleton tuned to work with a specific set of extensions. 

It's easy to create new templates and use them instead of the existing ones. Templates are typically very small compared to other forms of boilerplates/starter kits.

[Read more here.](/docs/Templates.md)
