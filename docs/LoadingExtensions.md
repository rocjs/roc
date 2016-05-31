# Loading extensions in projects

Roc will by default search through the `dependencies` and `devDependencies` within the project `package.json` and find every dependency that matches `roc-package-*` or `roc-plugin-*` and use that for the application. The order of them will be based on the order within `package.json` and is not guaranteed. External factors like `npm` can modify this.

If a specific order is needed, a subset of the Roc packages should be used or if some packages do not match the pattern mentioned above one can define exactly what should be used and in what order using the `roc` property in the projects `package.json` file. This should be an object with two possible properties, `packages` and `plugins` that are arrays that points to Roc extensions in one of the possible ways.

- Absolute path
- Relative path
- Full npm module name, like `roc-package-web-app-react`
- Short npm module name, like `web-app-react` (`roc-package` and `roc-plugin` will be added automatically)

Roc will expect that these modules have a default export that exposes at least an object named `roc`.


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
      "plugin": [
        "browsersync",
        "/absolute/path/to/plugin"
      ]
  }
}
```
