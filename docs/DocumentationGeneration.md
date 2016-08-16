# Documentation Generation
An important part of Roc is documentation generation and is used both by extensions and projects. This utilizes the data structure that Roc implements to generate Markdown for several parts of Roc, mainly:

* Overview (README.md / ROC.md)
* Actions
* Commands
* Configuration
* Dependencies
* Extensions
* Hooks
* Settings

## Extensions
Using `roc-internal-dev` extensions have a way to automatically generate documentation.

```bash
$ rid docs
```

Will create a `README.md` for each extension along with a folder at `docs/` containing the rest of the documentation.

## Projects
Projects can generate documentation for their current setup by using the command line interface.

```bash
$ roc meta docs
```

This will create a `ROC.md` inside the root of the project along with several additional markdown files inside `/docs`. This is useful as a way to easily get an overview over the current state of the project. This command will only be available when inside a valid Roc project.

[For more details about the command please see the generated documentation for it.](#/docs/default/Commands.md#docs)
