# roc-config
Configuration manager for the Roc ecosystem.

![stability alpha](https://img.shields.io/badge/stability-alpha-red.svg)
[![roc](https://img.shields.io/npm/v/roc-config.svg)](https://www.npmjs.com/package/roc-config)
[![Build Status](https://travis-ci.org/vgno/roc-config.svg)](https://travis-ci.org/vgno/roc-config)
[![Coverage Status](https://coveralls.io/repos/vgno/roc-config/badge.svg?branch=master&service=github)](https://coveralls.io/github/vgno/roc-config?branch=master)
[![Code Climate](https://codeclimate.com/github/vgno/roc-config/badges/gpa.svg)](https://codeclimate.com/github/vgno/roc-config)
[![Issue Count](https://codeclimate.com/github/vgno/roc-config/badges/issue_count.svg)](https://codeclimate.com/github/vgno/roc-config)
[![Dependency Status](https://david-dm.org/vgno/roc-config.svg)](https://david-dm.org/vgno/roc-config)

## Important

This project will look for two environment variables; `ROC_CONFIG` and `ROC_CONFIG_OBJECT`.  
If `ROC_CONFIG_OBJECT` is found those will be used **instead** of what has been appended during runtime elsewhere.

If there is a conflict where both an environment variable is set and something is appended manually, there will a a clear warning given to the user.

Once imported to your project **the configuration and all its internal states** will persist throughout the process lifetime.

## Documentation

To generate documentation please run `npm run docs`.

## Configuration source priority
Configurations provided by environment `ROC_CONFIG_OBJECT` have highest priority amongst appends. This **overwrites all other appended properties without merge**.

If a configuration file path is provided by environment `ROC_CONFIG` it will load this instead of a configuration file within the project, without merging the two. Note that it _is_ subject to programmatic appends, it just loads from a different file.

`getFinalConfig()` will merge any appended programmatic configuration (or environment object) into configurations loaded from file and then finally merge this into it's own optional configuration parameter.

## Application Configuration Format

For _roc-config_ to understand a `roc.config.js` provided by the CLI or `ROC_CONFIG` it needs to export an object with a `config` key. This example should give a basic idea. Configurations will vary amongst Roc extensions, but they must always expose the `config` key at the time that it is called.

```js
module.exports = {
    config: {
        port: 8080,
        serve: 'files',
        build: {
            entry: {
                client: 'client.js',
                server: 'server.js'
            }
        },
        dev: {
            open: true
        }
    }
};
```

This example works with `roc-web`

## API Examples

Use configuration:
```js
import { getFinalConfig } from 'roc-config';

const config = getFinalConfig();

```

Extend configuration with custom configuration and use it:
```js
import { getFinalConfig } from 'roc-config';

const customConfig = {
    property: 'value'
};

const config = getFinalConfig(customConfig);
```
Perform multiple modifications and use:
```js
import { getFinalConfig, appendConfig } from 'roc-config';

// deep merges parameter to current appended configuration state
appendConfig({
    value: 'value'
});

appendConfig({
    value2: 'value2'
});

// config will hold { "value": "value", "value2": "value2" }
const config = getFinalConfig();
```
