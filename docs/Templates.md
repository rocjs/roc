# Templates

Templates are used as a way to quickly bootstrap a project and consists of code that are not meant to be updated by Roc. Therefore they should be kept minimal and let the user make modifications easily. Used by the [init command](/docs/Commands.md#init).

## Hosting
Templates should be located on Github and use tags for versions, if no tags are available `master` will be used instead.

A recommendation is to use versions following this pattern `vX.Y.Z`.

## Structure
A standard structure of a template is:
```
package.json
roc.setup.js
template/
```

See an example [here](https://github.com/vgno/roc-template-web).

### package.json
A normal `package.json` file containing the dependencies needed for doing the setup of the project.

### roc.setup.js
File used by Roc when setting up the project. Currently it is expected that it exports an object with a property `prompt` that follows [inquirer.js](https://github.com/SBoudrias/Inquirer.js) structure and the answers will later be used for replacing values in the `template/` folder. Not required however needed to extend/overriding the default prompt from Roc itself.

If one wants to extend a manual merge must be performed by importing the default prompt and merge the array with whatever ones what to add. It can be imported by `import { defaultPrompt } from 'roc'` or `const defaultPrompt = require('roc')`.

#### Default prompt
```js
export const prompt = [{
    type: 'input',
    name: 'rocAppName',
    message: 'What\'s the name of your application?',
    default: 'my-roc-app',
    filter: (input) => input.toLowerCase().split(' ').join('-')
}, {
    type: 'input',
    name: 'rocAppDesc',
    message: 'What\'s the description for the application?',
    default: 'My Roc Application'
}, {
    type: 'input',
    name: 'rocAppAuthor',
    message: 'Who\'s the author of the application?',
    default: 'John Doe'
}, {
    type: 'input',
    name: 'rocAppLicense',
    message: 'What\'s the license for the application?',
    default: 'MIT'
}];
```

### template/
A folder containing files needed for a normal application with `package.json` and potential `roc.config.js` and more. Important to note here is that Roc requires that there exist a `package.json` file in this directory and that it either has at least one dependency on a a Roc extension matching the `roc-*` pattern or it has a `roc.config.js` file that defines [extensions](/docs/config/extensions.md).

All files in the directory will be parsed using a Handlebars syntax: looks like this `{{ KEY }}`. All occurrences of this pattern will be replaced if there is a match with something from the prompt. That is the `KEY` will be based on the `name` from the prompt property that can be seen above. For instance will occurrences of `{{ rocAppName }}` be replaced with `my-roc-app` if no other value is given when the prompt asks.

Something to remember here when creating your own template is that if you use Handlebars for the application itself make sure that you are not using clashing names since you might then change something that should stay as a template value.
