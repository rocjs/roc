# Loading extensions in projects

Roc will by default search through the `dependencies` and `devDependencies` within the project `package.json` and find every dependency that matches `roc-package-*` or `roc-plugin-*`. Scoped packages are managed and the scope will not be included when matching against the pattern mentioned. This means that `@scope/roc-package-*` will also be matched for example. The order of them will be based on the order within `package.json` and is not guaranteed. External factors like `npm` can modify this. Note that the order will not be relevant in most cases.

If a specific order is needed, a subset of the Roc packages should be used or if some packages do not match the pattern mentioned above one can define exactly what should be used and in what order using the `roc` property in the project's `package.json` file. This should be an object with two possible properties, `packages` and `plugins` that are arrays that points to Roc extensions in one of the following ways.

* Absolute path
* Relative path
* Full npm module name  
    For example: `roc-package-web-app-react`
* Short npm module name  
    For example: `web-app-react` _(Will not work with scoped packages where the entire name is needed)_

Roc will expect that these modules have a default export that exposes at least an object named `roc`.

[See more about how extensions work here.](/docs/Extensions.md)

__Example__

```json
{
  ...
  "dependencies": {
    ...
  },
  "roc": {
      "packages": [
        "roc-package-module",
        "./relative/path/to/package"
      ],
      "plugins": [
        "browsersync",
        "/absolute/path/to/plugin"
      ]
  }
}
```
`browsersync` above will be matched against `roc-plugin-browsersync`.
