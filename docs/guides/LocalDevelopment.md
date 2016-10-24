# Local development of extensions
Say you have an extension that your project is using and you think their might be a bug with it, how would you go about approaching this?

## Using `roc-internal-dev` for building and linking
All of the official extensions are built with Roc themselves through the [`roc-internal-dev`](https://github.com/rocjs/roc-internal-dev) module. It has several responsibilities but mainly it does building and local linking of extension.

Let’s look at this a little closer through an example where we will fix a hypothetical issue in `roc-package-web-app-react`.

## 1. Get the code

We will start cloning the repo so we have it locally.

```
git clone git@github.com:rocjs/roc-package-web-app-react.git
cd roc-package-web-app-react
```

## 2. Install development dependencies

When standing in the root of the project we can install the development dependency we need, `roc-internal-dev`, by running `npm install`.

```
npm install
```

## 3. Linking and building the extensions

With the development tool installed we are able to use it to setup the project for local development. Most projects have provided an alias to `roc-internal-dev` through the `start` command using npm.

```
npm start
```
We will here get a list of all available commands.

```
npm start link
```
This will link the projects up and install their dependencies. This means that we are able to use them in other projects using `npm link <extensionName>`, more on this later.

## 4. Build the project

With the project linked and all of our dependencies installed we are ready to build the code.

```
npm start build
```

Or if we want to watch for changes and rebuild when something is updated.

```
npm start build:watch
```

## 5. Use in a project

Now we are ready to test out the extension in an actual project. We can do this by linking it in the project.

In this example will use on of the existing examples but this can be a standalone project as well.

```
cd examples/complex
```

To minimize bugs we want to make sure that we do not have a `node_modules/` folder from before.

```
rm -rf node_modules
```

We can now link the dependencies that we want to test, in this case `roc-package-web-app-react` and `roc-package-web-app-react-dev`.

```
npm link roc-package-web-app-react roc-package-web-app-react-dev
npm install
```

We can now use the project as we would normally, in this case we will start it development mode.

```
roc dev
```

Now we are running the project with our local extension.
