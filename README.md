# [Roc](http://www.getroc.org)
Focus on writing great software and away from juggling boilerplate, configuration files and ever changing dependencies.  

![stability beta](https://img.shields.io/badge/stability-beta-yellow.svg)
[![roc](https://img.shields.io/npm/v/roc.svg)](https://www.npmjs.com/package/roc)
[![build status](https://travis-ci.org/vgno/roc.svg)](https://travis-ci.org/vgno/roc)
[![Coverage Status](https://coveralls.io/repos/vgno/roc/badge.svg?branch=master&service=github)](https://coveralls.io/github/vgno/roc?branch=master)
[![Code Climate](https://codeclimate.com/github/vgno/roc/badges/gpa.svg)](https://codeclimate.com/github/vgno/roc)
[![Issue Count](https://codeclimate.com/github/vgno/roc/badges/issue_count.svg)](https://codeclimate.com/github/vgno/roc)
[![Dependency Status](https://david-dm.org/vgno/roc.svg)](https://david-dm.org/vgno/roc)

## Introduction
Roc is development tool that makes it easier to create web applications and components without the boilerplate fragmentation and complex setup processes. It does this in a modular and extendable way.  

Roc makes it easy to; using existing extensions:
* Create production ready [React](http://facebook.github.io/react/) applications featuring universal rendering.
* Create general web applications running on a [Koa](http://koajs.com/) server.
* First class developer experience with hot reloading and [Browsersync](http://browsersync.io).
* Best in class build setup using [Webpack](http://webpack.github.io/) and [Babel](http://babeljs.io).  

Basically Roc composes some great open source tools and make them easy to use with a streamlined command line interface and configuration/extension system. If needed Roc allows for overriding of every aspect of it, so it does not limit you.

## Get started
### Install Roc
```
npm install -g roc
```
This provides you with a really simple command line interface. Only Linux and OS X is _currently_ supported.

### Bootstrap React + Redux application
```
mkdir react-app && cd react-app
```
```
roc init web-react
```
```
roc dev
```
This will:
* create a new directory
* init a Roc project inside it that uses React and Redux
* start the project in development mode

### Production ready
To build and run in production just use:
```
roc build
```
```
roc start
```

### Where to go from here
See the documentation for the extension that is used for more details on what it does. A very common use-case is to make modifications to your `roc.config.js`. To get a better understanding of all the possible options in the extension use the `roc list-settings` command or `--help` for a specific command.

## Extensions
Roc is highly flexible and makes it easy to create new extensions and Roc does not enforce limits on what the extensions do or how they do it. It is trivial to both create new extensions and to extend existing ones. For example it would be possible to create a alternative to `roc-web` that uses [Browserify](http://browserify.org/) instead of [Webpack](http://webpack.github.io/).

### Current Extensions
| Project | Github page |
| ------- | ----------- |
| Roc Web | https://github.com/vgno/roc-web |
| Roc Web React | https://github.com/vgno/roc-web-react |

#### Example of tasks handled by these extensions
- Building and bundling through [Webpack](http://webpack.github.io/).
- Web server through [Koa](http://koajs.com/).
- [React](http://facebook.github.io/react/) (complete with [Redux](https://github.com/rackt/redux) and server side rendering).
- First class developer experience featuring hot code reloading and [Browsersync](http://browsersync.io).

## Motivation
Roc was born out of the need to create modern applications following the correct conventions and using best practices consistently.

We quickly realized that keeping boilerplate updated within each project over time was unmanageable. It seems natural to have this _repeated complexity managed by separated semantically versioned packages_.

## Contribute
We are still working on getting the balance between flexibility and easy-of-use. Input here is valuable to us and please contribute if you want, we welcome you to interact.

## Thanks
Thanks to [Jongleberry](https://github.com/jonathanong) for letting us use the `roc` package name on npm.
