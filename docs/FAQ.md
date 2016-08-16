# Frequently Asked Questions

### What is the difference between a package and a plugin?
Both of them are very similar and the difference is more in how they are supposed to be used and not any big technical differences. That means that plugins and packages generally speaking have the same power in what they can do.

A Roc project needs to depend on at least one package to be considered valid. One way to see it is that packages are single dependencies that can be used to do something in a Roc project. Plugins are enchantments that are added to the top of packages to give the project additional features.

Let’s look at this with some real examples. `roc-package-web-app` is a package since it’s critical to be able to do anything in a project. `roc-plugin-style-sass` on the other hand fits great as a plugin since it enhances the package with support to use Sass. `roc-package-style-sass` would not make sense since that would not by itself be enough to do anything in a project.

### I have a feature that I would like to add to a package, should I make a PR that adds it or should it be a plugin?
There is of course no clear answer to this question and every situation is different. However as a general rule it can be good to think about what the feature one wants to add does. Is it something that everyone that uses the package most likely would want? Then it should probably be added to the package directly. Is this feature something that only will beneficial to this package or potentially several different packages? If the later it should probably be a plugin so it can be reused across several packages.

A good start when experimenting with something a bit more complex is to always start with it being a plugin. This allows for easy experimentation without having to change any packages and if the feature works as intended it can later be moved into a package directly.

### I want a feature that is currently not available in any extension, how can I solve this for my project in the most convenient way?
You don’t need to create a new extension for every new feature that you need in a project. A good start is to start by adding use the available hooks through custom actions. This can be done by adding actions to the [`actions`](/docs/Configuration.md#actions) property in the `roc.config.js` file. Even more advanced things can also be done using the [`init`](/docs/Configuration.md#init) property in the same file.

This is a great place to start when experimenting with a new feature.

### I have some logic in my `roc.config.js` that I would like to make into an extension, how can I do that?
In this case you might have settings, actions or specialised logic in `init` function that you would like to make reusable by promoting it to be an extension.

One way is to create a [new extension](/docs/guides/CreateExtension.md) and then use [`npm link`](https://docs.npmjs.com/cli/link), making it possible to use it in the project. Another is to [create a standalone extension](/docs/RocObject.md#standalone). This can be great for prototyping without having to create an entirely new project.

### I want to add some functionally to my project that can’t be done through the project API and is something strictly unique to this specific project, what is the best way to go about this?
You can use a “standalone” extension if there is something that you want to keep local to a specific project. It has the full power and the same API as a normal extension but does not require you to create a npm module, meaning that you easily can keep it inside you project.

[See more here on how to create a standalone extension.](/docs/guides/CreateExtension.md#create-a-standalone-extension)  

### How do I create an extension?
[See this guide for how to do this.](/docs/guides/CreateExtension.md)

### How do I create a template?
[See this guide for how to do this.](/docs/guides/CreateTemplate.md)

### What is the advantage to use this over a boilerplate?
Boilerplates can be used to quickly get started but after the initial setup you as a developer are fully responsible for all the configuration. You have no easy way to update the code that was provided from the boilerplate if the maintainer for it fixes something.

Roc on the other hand moves much of the code that would typically be provided from a boilerplate to versioned npm modules. This allows for the project to get the latest and greatest code without having to really on manual merges. This allows you to maintain a very clean separation of concerns as your projects evolve.

Another advantage that this brings it that it makes it easy to share the setup across several projects and easily fix issues in all of them in a single place.

### Is this not Yeoman?
No.

At first sight it might seem that Roc is similar to Yeoman but they do not address the same problem. Yeoman scaffolds a project for you based on a generator that might ask you some questions about how you want to setup your project. However after that has been performed there is no easy way to update the project if a new version of the generator is created. Yeoman will additionally add a lot of code into your project which is basically boilerplate code, that you will seldom touch. And if you manually fix some bug in the generated code you will have to manually do the same work in all other possible projects that are based on the same generator.

Roc will push a lot of the code that you would normally get from a generator away from your project and into versioned packages that can be updated and interacted with through a common interface. This means that you do not get code inside your projects that you will not care about most of the time like configuration files and common boilerplate, making it possible to update it. This leaves you with only the most important code inside your project. Additionally Roc is a composable system making it easy to add additional functionality with minimal effort after the initial project setup.

With that said you could definitely use Yeoman together with Roc if you so wish.

### An extension is providing me with a dependency, I would like to you the local one in my project. How can I do this?
There currently are two ways to disable exported dependencies from extensions.

1. An easy way is to add a prefix, `_`, in front of the import to disable it from being managed by Roc.

__Example__
```javascript
import lodash from '_lodash';

var lodash = require('_lodash');
```

2. If a more permanent solution is desired it is possible to remove a dependecy all together through [the `init` function in `roc.config.js`](/docs/Configuration.md#init).

__Note__
One thing to note here is that this might create unwanted side effects in your project with multiple versions of the same dependencies being used at the same time.

### Why should my _”large”_ team use Roc?
This is actually the main reason why Roc was created in the first place. To make it easier for teams to collaborate and work on multiple projects with minimal overhead.

This philosophy, to make it easier for large teams to work with modern JavaScript projects, affects most design decisions in Roc. Some benefits are quite obvious like making it faster to get started, removing boilerplate, requiring minimal configuration and making it easier to update code in one central place. It is also the main reason behind Roc’s modular architecture, allowing anyone to create custom templates and extensions with a high degree of customisability. We knew from the start that we will never be able to create a single experience that will fit everyone and through this design decision each team/company can tune the experience to their specific needs.

A common use case might be to create a custom set of extensions and templates that builds on top of already existing ones that conforms to the coding style and likes of a particular team our that servers as the base for a set of very similar applications. An example of this could be to create a testing extension that uses Jasmine instead of Mocha, replace React Router with an alternative router in `roc-package-web-app-react` or to include some common code that should be present in multiple applications.

Important to note is that does not make it less suited for smaller teams and projects, rather the opposite since almost everything benefits all projects independent on their size. Additionally their will always be focus on supported extensions that will cater for most projects and situations.

### What makes Roc different from other similar solutions like nwb and create-react-app?
The biggest difference is most often two things, composability and agnostic to technologies. This means that Roc allows for flexibility where needed, allowing users to override defaults and choose what they need.
