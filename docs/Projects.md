# Projects
Projects are the consumers of extensions and will typically be applications, components and modules. They will often be instantiated from templates that will use a specific set of extensions for some predefined purpose.

This document will serve as a basic introduction about how Roc works and highlight the important parts for project developers.

## Setting up a new project
For something to be consider a valid Roc project it needs to have at least one dependency on a Roc package. This dependency can be specified in several ways but in the most cases the user will not need to do anything.

[See here for all of the different ways to specify what extensions a project should use.](/docs/LoadingExtensions.md)

When you are creating a new project you can either create it manually or use the Roc CLI.

### Using the CLI
We will assume that you have installed `roc` globally which gives us access to it on the command line.

You have two options when creating a new project with `roc`, either using `roc create new` or `roc create init`. `new` will create a new folder in which the project will be instantiated while init will use the current folder. We will use `init` but pick the one that fits your use case.

[See more about the two commands here.](/docs/default/Commands.md)

_Tip: Roc will automatically find commands in groups like "create", we can use roc init without "create" here._

We will now create a new React project.

```bash
$ mkdir my-react-project
$ cd my-react-project
$ roc init web-app-react
```

That is it, we now have a project with some example code using React and Roc.

### Manually
The only thing you really need to create a new Roc project is to setup a npm project and add at least one Roc package that you want to use. We will create a React project here as an example.

```bash
$ mkdir my-project
$ cd my-project
$ npm init
$ npm install roc-package-web-app-react --save
$ npm install roc-package-web-app-react-dev --save-dev
```

We now have a working project that we can start adding code to.

## Working with an existing project
Let's assume we have a existing Roc project, how can we interact with it?

### Running commands
If `roc` has been installed globally it's possible to just run commands straight inside the project root. The available commands will change depending on the extensions that are used in the project and to see the current ones you can simply type `roc`.

If `roc` is not installed globally it could be a good idea to add an alias to it in the `package.json`. This can be done using a npm script like below.

```json
script: {
    "roc": "roc"
}
```

Then it's possible to run `npm run roc` to get the available commands. You could also add the alias under `start` to save a little typing.

```json
script: {
    "start": "roc"
}
```

Now it is possible to run with just `npm start`.

[Read here for how the CLI works in more detail.](/docs/CLI.md)

### Generate documentation
A useful thing that is possible to do in Roc projects is to generate documentation for the current setup in a project. This can be done by calling `roc meta docs`, or just `roc docs`. When doing this a `ROC.md` will be added to the project along with a `docs/` folder containing markdown documentation. This documentation contains everything from the available commands to all possible settings and much more.

### Changing configuration
Roc will by default look for a `roc.config.js` file in the root of the project that can be used to override default configuration from extensions. The easiest way to know what is possible to configure is to either look at the generated documentation or use `roc meta list-settings` command.

[Read here for more information about how configuration works in projects.](/docs/Configuration.md#configuration-in-projects)

### Runtime
Roc will add a runtime by default when using the CLI. This runtime will make sure that the project is valid and also provide access to the configuration if needed and provide potential dependencies that extensions has exported to the project. Project developers will generally not need to know how the runtime functions in detail and it will just work in almost all situations.

[Read here for more details about the runtime.](/docs/Runtime.md)
