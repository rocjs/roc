# Templates

Templates are used as a way to quickly bootstrap a project and consists of code that is not meant to be updated by Roc. Because of this reason they should be kept minimal allowing the user make modifications easily and where most dependencies are managed by Roc extensions.

Used by the [init](/docs/default/Commands.md#init) and [new](/docs/default/Commands.md#new) commands.

## Usage

```bash
$ roc init [template] [version]
```

```bash
$ roc new <name> [template] [version]
```

Both commands function in the way for the most part with the difference in that `new` requires a name that will be used when creating the project for setting up a new folder.

A version is either a branch or tag.

## Templates
Roc supports templates from a multitude locations.

It's currently recommended to primarily use [GitHub](https://github.com) for public templates since Roc supports better versioning of those allowing giving the end users better feedback.

### Local template
Local templates can be used, especially useful during development.

__Example__  

```
$ roc init ../my-template
```

### Local `.zip` template
Creates a new project from an archived template.

__Example__  

```bash
$ roc init my-template.zip
```

### Official templates
Roc comes with some official templates that are hosted on the [rocjs](https://github.com/rocjs) organisation.

Some examples of existing templates.
- [roc-template-web-app](https://github.com/rocjs/roc-template-web-app)
- [roc-template-web-app-react](https://github.com/rocjs/roc-template-web-app-react)
- [roc-template-plugin](https://github.com/rocjs/roc-template-plugin)
- [roc-template-package](https://github.com/rocjs/roc-template-package)

__Example__  

```bash
$ roc init roc-template-web-app-react [version]
```

```bash
$ roc init web-app-react [version]
```

All of the official ones will be listed when the `init` or `new` command is invoked without a provided template.

### GitHub
Roc will by default interpret template names with a slash in them as a GitHub template. Roc expects that templates are tagged with their version and the recommended format is to use `vX.Y.Z` as a pattern.

Roc will fallback to `latest` if no tags are available.

__Example__

```bash
$ roc init rocjs/roc-template-web-app-react [version]
```

A version can also be specified that can be either a branch or tag.

```bash
$ roc init rocjs/roc-template-web-app-react next
```

```bash
$ roc init rocjs/roc-template-web-app-react 2.1.0
```

### GitLab / Bitbucket / GitHub
It is possible to use a template that is hosted on either GitLab, Bitbucket or GitHub (avoiding the version verification) by specifying a prefix in front of the template name.

__Example__

```bash
$ roc init github:owner/name [version]
```

```bash
$ roc init gitlab:owner/name [version]
```

```bash
$ roc init bitbucket:owner/name [version]
```

Will default to `latest` if no version is provided.

 _Uses [download-git-repo](https://github.com/flipxfx/download-git-repo) internally._

### Generic Git
It is possible to provide a generic git repository to clone as a template. Useful for templates hosted on other services than the ones listed above, for example GitHub Enterprise instances and private Git servers.

__Example__
```bash
$ roc init git@github.com:rocjs/roc-template-web-app-react.git [version]
```

## Structure
A standard structure of a template is:
```
package.json
roc.setup.js(on)
template/
```

[An example can be seen here.](https://github.com/rocjs/roc-template-web-app-react)

### `package.json`
A normal `package.json` file containing possible dependencies that is needed for doing the setup of the template.

### `roc.setup.js(on)`
Optional file used by Roc when setting up the project. Can be either a JSON file or a JavaScript file.

#### `completionMessage`
The `completionMessage` property is used to give feedback to a user `roc init` has successfully been completed. It could for instance be used to inform of what command to run next. The message will be processed through Handlebars and can use logic to show different things.

Alongside the answers, two useful variables are provided to make it easier to create smarter messages

`destDirName`  
The name of the directory that the project has been created in. Can be used to tell the user what folder to `cd` into.

`inPlace`  
If the current working directory is inside the project or not, useful since `new` will create a new directory by default and `init` will use the current directory. Can then conditionally tell the user to `cd` into the new project.

#### `prompts`
The `prompts` property follows [Inquirer.js](https://github.com/SBoudrias/Inquirer.js) structure and the answers will later be used when processing the `/template` directory using [Handlebars](http://handlebarsjs.com/) with the key being the variable name.

```json
{
  "prompts": {
    "name": {
      "type": "string",
      "required": true,
      "message": "Project name"
    },
    "author": {
      "type": "string",
      "required": true,
      "message": "Author"
    }
  }
}
```

`name` and `author` are a bit special and will automatically default to the directory name and, if available, the name from the git config.

##### `when`
It is possible to define conditional prompts that only will be shown in some instances.

```
{
  "prompts": {
    "test": {
      "type": "confirm",
      "message": "Add tests?"
    },
    "testSetup": {
      "when": "test",
      "type": "list",
      "message": "Pick a test setup",
      "choices": [
        "mocha",
        "ava",
        "jest"
      ]
    }
  }
}
```

The prompt for `testSetup` above will only be shown if the user answered yes to the `test` question.

#### `data`
`data` property contains any arbitrary data you'd like to pass to templates. It supports both simple values and async functions / promises that eventually get resolved to values.
Note that functions are supported only when using `.js` version of a config. If you use function there it will receive an object containing collected answers as a parameter.

```javascript
{
  "data": {
    "version": "1.0.2",
    "recentChanges": (answers) => fetch("https://some-changelog.org/recent")
  }
}
```

#### `filters`
Filters can be useful to conditionally include files for the project based on answers from the prompt.

```json
{
  "filters": {
    "test/**/*": "test"
  }
}
```

Here all the files in `test/` would be included if the user answered yes to the “test” question above.

#### `helpers`
It is possible to add additional Handlebars helpers if needed. Two are provided by default: `if_eq` and `unless_eq`.

```handlebars
{{#if_eq testConfig "jest"}}
// Jest specific things
{{/if_eq}}
```


```javascript
module.exports = {
  helpers: {
    removespaces: str => str.split(' ').join('-')
  }
}
```

Can then be used in the `/template` as:
```handlebars
{{ removespaces name }}
```

#### `required`
The template can use this to specify a SemVer range that the template will work with.

Current version is `1.0.0`;

### template/
A folder that is __required__ to exist and containing files needed for a normal projects with `package.json` and potentially a `roc.config.js` and more.

Important to note here is that Roc requires that there exist a `package.json` file in this directory and that it either has at least one dependency on a Roc package matching the `roc-package-*` pattern or that at least one package has been defined in the `roc.packages` property in the `package.json` for the project to be considered a valid Roc project.

[See more about how Roc loads extensions here.](/docs/LoadingExtensions.md)

Something to remember here when creating your own template is that if you use Handlebars for the project itself make sure that you are not using clashing names since you might then change something that should stay as a template value.

## Inspiration
The second iteration of the template logic has been inspired by the [vue-cli](https://github.com/vuejs/vue-cli).
