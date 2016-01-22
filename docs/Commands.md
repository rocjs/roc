# Commands
Roc is dynamic in its nature and new commands can easily be added and removed from it. Most commands will come from the extensions that are used for a particular application but some will be provided by default from Roc itself. The commands below are Roc defaults and will be available in most situations. For more commands please see the extensions documentation or run `roc --help` to get information of the currently available commands.

## init
```
init [template] [version]   Init a new project.   
```

The __init__ command can be used to initiate a new Roc project and currently expects that it's run inside an empty directory. As can be seen above it takes two optional arguments, template and version. If no template is given a prompt will be shown with the possible alternatives that exists. Currently these alternatives are coded into Roc and matches `web` and `web-react` mentioned below. There is a plan to instead manage this from a remote location making it easy to add and remove templates.

### template
Template can either be a short name for a specific template, currently it accepts `web` and `web-react` that will be converted internally to `vgno/roc-template-web` and `vgno/roc-template-web-react`. As can be seen here the actual template reference is a Github repo and can be anything matching that pattern `USERNAME/PROJECT`.

It will also expect that the template has a folder named `template` and that inside of it there is `package.json` file with at least one dependency to a Roc module following the pattern `roc-*` or that it has a `roc.config.js` file (this file is then expected to have some [extensions](/docs/config/extensions.md) defined but this is not checked immediately).

For exactly how a template can be structured and functions please see the separate documentation for that [here](/docs/Template.md).

### version
Versions should match a tag on the Github repo and will default to master if none exists. When giving an input on the command line Roc will automatically add `v` in front of versions that starts with a number to match Github default that have versions tags that start with `v` like `v1.0.0`. `master` is also always available as an option.

### Internal flow

1. Downloads the template and places it in a temporary directory.
2. Installs setup dependencies using `npm install`.
3. Shows prompt asking for basic data.
4. Replaces values in template/.
5. Renames the template `package.json` to `.roc` for history purposes, to know what template created the application.
6. Moves the files to the current working directory.
7. Runs `npm install` again but this time on the `package.json` that was in the template/ directory.
