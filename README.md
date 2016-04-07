# [Roc](http://www.getroc.org)
![logo](roc.png)

Build __web applications__ and __components__ using modern JavaScript libraries easily.

Quickly create products powered by libraries like [React](http://facebook.github.io/react/) and [Redux](https://github.com/rackt/redux) ready for deployment in production with minimal additional setup using tools like [Webpack](https://github.com/webpack) and [Babel](https://babeljs.io/) .  

![stability rc](https://img.shields.io/badge/stability-RC-green.svg)
[![roc](https://img.shields.io/npm/v/roc.svg)](https://www.npmjs.com/package/roc)
[![build status](https://travis-ci.org/rocjs/roc.svg)](https://travis-ci.org/rocjs/roc)
[![Coverage Status](https://coveralls.io/repos/rocjs/roc/badge.svg?branch=master&service=github)](https://coveralls.io/github/rocjs/roc?branch=master)
[![Code Climate](https://codeclimate.com/github/rocjs/roc/badges/gpa.svg)](https://codeclimate.com/github/rocjs/roc)
[![Dependency Status](https://david-dm.org/rocjs/roc.svg)](https://david-dm.org/rocjs/roc)

## At a glance
Roc provides a __cli__ for managing development, building and runtime configuration. It also boasts an architecture that sweeps complexity of __npm library compositions__ away from your application.

- Orchestration complexity moved away from your applications or components
- Application code is exactly that; not __boilerplate__ or __glue__-like operations
- Consistent configuration and runtime management

Several opinionated packages and plugins exist that can save a lot of time if aligned with your preferences, for example providing [Webpack](https://github.com/webpack), [Babel](https://babeljs.io/) and [React](http://facebook.github.io/react/) ready to be used.

## Introduction
Development toolkit that makes it easier to create web applications and components without the boilerplate fragmentation and complex setup processes. It does this in a modular and extendable way.  

Makes it easy to; using existing packages:
* Create production ready [React](http://facebook.github.io/react/) applications featuring universal rendering.
* Create general web applications running on a [Koa](http://koajs.com/) server.
* First class developer experience with hot reloading and [Browsersync](http://browsersync.io).
* Best in class build setup using [Webpack](http://webpack.github.io/) and [Babel](http://babeljs.io).  

Basically Roc composes some great open source tools and make them easy to use with a streamlined command line interface and configuration/extension system. Roc allows for overriding of every aspect of it, so it does not limit you.

## Get started
### Install Roc
```
npm install -g roc
```
This provides you with a really simple command line interface. Only Linux and OS X is _currently_ supported.

### Bootstrap React + Redux application
```
roc new react-app web-app-react && cd react-app
```
```
roc dev
```
This will:
* Create a new directory
* Init a Roc project inside it that uses React and Redux
* Start the project in development mode

### Production ready
To build and run in production just use:
```
roc build
```
```
roc start
```

### Where to go from here
Read the documentation for the particular package that is used for more details on what it does. A very common use-case is to make modifications to your `roc.config.js`. To get a better understanding of all the possible options in the package use the `roc list-settings` command or `--help` for a specific command.

## Extensions
Roc is highly flexible and makes it easy to create new extensions. It does not enforce limits on what the extensions do or how they do it. It is trivial to both create new extensions in the form of packages and plugins as well as to extend existing ones. For example it would be possible to create a alternative to `roc-web` that uses [Browserify](http://browserify.org/) instead of [Webpack](http://webpack.github.io/).

### Current Official Packages & Plugins
[See the repositories under this organisation](https://github.com/rocjs)

### Example of tasks handled by these extensions
- Building and bundling through [Webpack](http://webpack.github.io/).
- Web server through [Koa](http://koajs.com/).
- [React](http://facebook.github.io/react/) (complete with [Redux](https://github.com/rackt/redux) and server side rendering).
- First class developer experience featuring hot code reloading and [Browsersync](http://browsersync.io).
- Transpiling from ES2015 _(ES6)_ and beyond using [Babel](http://babeljs.io).

## Documentation
See the [documentation](/docs/README.md).

## Motivation
Roc was born out of the need to create modern applications following the correct conventions and using best practices consistently.

We quickly realized that keeping boilerplate updated within each project over time was unmanageable. It seems natural to have this _repeated complexity managed by separated semantically versioned packages_.

Development of Roc was started before these posts where created but they still describe what Roc aims to solve in a good way:

* [Challenge: Best JavaScript Setup for Quick Prototyping](http://blog.vjeux.com/2015/javascript/challenge-best-javascript-setup-for-quick-prototyping.html) by [**@vjeux**](https://github.com/vjeux)
* [Javascript Fatigue](https://medium.com/@ericclemmons/javascript-fatigue-48d4011b6fc4) by [**@ericclemmons**](https://github.com/ericclemmons)

## Contribute
We are still working on getting the balance between flexibility and easy-of-use. Input here is valuable to us and please contribute if you want, we welcome you to interact.

## Thanks
Thanks to [Jongleberry](https://github.com/jonathanong) for letting us use the `roc` package name on npm.
