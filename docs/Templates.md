# Templates

Templates are used as a way to quickly bootstrap a project and consists of code that is not meant to be updated by Roc. Because of this reason they should be kept minimal allowing the user make modifications easily. Used by the [init](/docs/default/Commands.md#init) and [new](/docs/default/Commands.md#new) commands.

## Hosting
Templates should be located on [Github.com](https://github.com) and use tags for versions, if no tags are available `master` will be used instead.

A recommendation is to use versions following this pattern `vX.Y.Z`.

It’s also possible to install a local template from a `.zip` file.

## Internal flow when installing a template using `init`/`new`

1. Downloads the template / Uses provided `.zip` file and places it in a temporary directory.
2. Installs setup dependencies using `npm install`.
3. Shows prompt asking for user data.
4. Replaces values in `template/` based on the provided data.
5. Renames the template `package.json` to `.roc` for history purposes, to know what template created the application. This file is not used in anyway and can safely be removed from the project.
6. Moves the files to the current working directory / selected directory.
7. Runs `npm install` again but this time on the `package.json` that was in the `template/` directory.

## Structure
A standard structure of a template is:
```
package.json
roc.setup.js
template/
```

[An example can be seen here.](https://github.com/rocjs/roc-template-web-app-react)

### package.json
A normal `package.json` file containing the dependencies needed for doing the setup of the template.

### roc.setup.js
File used by Roc when setting up the project. Can export two properties that will be used in Roc.

#### completionMessage
The `completionMessage` property is used to give feedback to a user `roc init` has successfully been completed. It could for instance be used to inform of what command to run next.

#### prompt
The `prompt` property follows [inquirer.js](https://github.com/SBoudrias/Inquirer.js) structure and the answers will later be used for replacing values in the `template/` folder. Not required, unless needing to extend/override the default prompt from Roc itself.

If one wants to extend the defaults, a manual merge must be performed by importing the default prompt and merge the array with whatever ones need to be added. It can be imported by `import { defaultPrompt } from 'roc'` or `const defaultPrompt = require('roc').defaultPrompt`.

##### Default prompt
```javascript
export default [{
    type: 'input',
    name: 'rocName',
    message: 'What\'s the name of your project?',
    default: 'my-roc-project',
    filter: (input) => input.toLowerCase().split(' ').join('-')
}, {
    type: 'input',
    name: 'rocDescription',
    message: 'What\'s the description for the project?',
    default: 'My Roc Project'
}, {
    type: 'input',
    name: 'rocAuthor',
    message: 'Who\'s the author of the project?',
    default: 'John Doe'
}, {
    type: 'input',
    name: 'rocLicense',
    message: 'What\'s the license for the project?',
    default: 'MIT'
}];
```

### template/
A folder containing files needed for a normal application with `package.json` and potentially a `roc.config.js` and more.

Important to note here is that Roc requires that there exist a `package.json` file in this directory and that it either has at least one dependency on a Roc package matching the `roc-package-*` pattern or that at least one package has been defined in the `roc.packages` property in the `package.json`.

[See more about how Roc loads extensions here.](/docs/LoadingExtensions.md)

All files in the directory will be parsed using a Handlebars syntax: looks like this `{{ KEY }}`. All occurrences of this pattern will be replaced if there is a match with something from the prompt. That is the `KEY` will be based on the `name` from the prompt property that can be seen above. For instance will occurrences of `{{ rocName }}` be replaced with `my-roc-project` if no other value is given when the prompt asks the user.

Something to remember here when creating your own template is that if you use Handlebars for the project itself make sure that you are not using clashing names since you might then change something that should stay as a template value.
