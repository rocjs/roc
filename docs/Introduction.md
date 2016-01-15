# Introduction

Roc is a tool that assists with creating web applications. It has the ambitious goal of making it easier to work with modern web development, that at times can be quite complex and requires a lot of tooling and configuration.

Roc itself aims to be as agnostic as possible and uses opinionated extensions to provide different frameworks and libraries along with templates for easy and predictable initial setup. When putting all of this together you get an ecosystem that enables developers to focus on writing great software and away from tooling and juggling boilerplates that degrade over time. 

By design it will in most cases be trivial to migrate away from Roc _(based on extensions)_ since the code you write is the same code you would write without it; just with less boilerplate, setup and dependency management.

## Overview
You can see Roc as mainly three separate things _(furthur subcategorization is possible)_. 
* Roc
* Extensions
* Templates 

You do not need to understand how everything is connected if you only want to create an application using existing templates and extensions, something that will be the case in most situations. However a short overview of what the different parts do is great for an understanding of how Roc functions and where to look if a problem occurs.

### Roc
Roc itself serves multiple purposes in the ecosystem and will mainly manage the following.

* CLI
  * `init` command
* Configuration Management
* Validation and Verification

You do not need to install Roc globally but it will make it easier to use the `init` command to easily setup new projects.

### Extensions
Extensions are opinionated modules that add code and configuration needed to build a project as well as some application code in some instances to make it easier to write applications and remove boilerplate. 

A Roc application can use multiple extensions that together composes everything needed to create an application. That is both build management, testing,  application code, CLI commands and much more. 

By design most extensions will try to be out of your way as much as possible and should in most cases not introduce anything specific to Roc. This makes it easier to learn and also migrate away from Roc if the need comes.

[Read more here.](/docs/Extensions.md)

### Templates
All code needed to create applications can't be managed by extensions alone and that is where templates come into the picture. Templates can be used to quickly bootstrap new projects with a skeleton tuned to work with a specific set of extensions. It's easy to create new templates and use them instead of the existing ones.

[Read more here.](/docs/Templates.md)
