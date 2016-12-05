# Creating an extension

This guide will go over how to quickly and easily create a basic Roc extension, be that a package or a plugin.

## Normal Extension

### 1. Create the project

_We will use a Roc template to create our extension but you do not have to do that._

We will start by creating a new project using the `init` command in Roc.

__Creating a package__
```bash
$ mkdir my-package && cd my-package
$ roc create init rocjs/roc-template-package
```

__Creating a plugin__
```bash
$ mkdir my-plugin && cd my-plugin
$ roc create init rocjs/roc-template-plugin
```

### 2. Define the Roc Object

A Roc extension is something that [exports an object named `roc`  from its main file](https://github.com/rocjs/roc/blob/master/docs/Extensions.md#api). This object, called the Roc Object, can define a number of things like commands and configuration, [all documented here](https://github.com/rocjs/roc/blob/master/docs/RocObject.md). Roc enforces that the Roc Object contains at least [a `name`, a `version` and one more thing other than `description`](https://github.com/rocjs/roc/blob/master/docs/RocObject.md#what-is-considered-a-valid-object). The `name` and the `version` will automatically be fetched from the extensions `package.json` if not manually provided.

__An example of a simple plugin__  

`package.json`
```json
{
  "name": "roc-plugin-example",
  "version": "1.0.0",
  "main": "index.js"
}
```  

`index.js`
```js
module.exports = {
  commands: {
    example: 'git log',
  },
};
```

When the plugin is installed we are able to run `roc example` to in turn run the `git log` command.

__Existing extensions__  
A great place for inspiration on how to structure extensions is to look at the existing one under [the rocjs organisation on GitHub](https://github.com/rocjs/).

### 3. Publish, Building, and more

A Roc extension is like any npm module and nothing special is needed to build or publish them. However when installing from the template a convenient tool will be provided called `roc-internal-dev` that can be used to make the process simpler. 

`roc-internal-dev` uses Roc internally and all the available commands that are available can be listed using `npm start`.

## Standalone Extension

A standalone extension is an extension that does not have a `package.json` and normally is the first version of an extension that is used directly in a Roc project without the need to publish it. See more [here about the `standalone` property](https://github.com/rocjs/roc/blob/master/docs/RocObject.md#standalone).  

__Relevant questions from FAQ__
- [I have some logic in my `roc.config.js` that I would like to make into an extension, how can I do that?](https://github.com/rocjs/roc/blob/master/docs/FAQ.md#i-want-to-add-some-functionally-to-my-project-that-cant-be-done-through-the-project-api-and-is-something-strictly-unique-to-this-specific-project-what-is-the-best-way-to-go-about-this)
- [I want to add some functionally to my project that can’t be done through the project API and is something strictly unique to this specific project, what is the best way to go about this?](https://github.com/rocjs/roc/blob/master/docs/FAQ.md#i-want-to-add-some-functionally-to-my-project-that-cant-be-done-through-the-project-api-and-is-something-strictly-unique-to-this-specific-project-what-is-the-best-way-to-go-about-this)
