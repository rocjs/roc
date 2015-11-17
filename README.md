# roc-config

Configuration manager for the Roc ecosystem.

## Notes

Important to note that this project will look for two environment variables; `ROC_CONFIG` and `ROC_CONFIG_OBJECT`.  
If either of them are found they will be used instead of what has been set during runtime. Please read the documentation to understand how this works in more detail.  

If there is a conflict where both an environment variable is set and something overriden manually, there will a a clear warning given to the user.

Once imported to your project the configuration and all its internal states will persist throughout the process lifetime.

## Documentation

To generate documentation please run `npm run docs`.

## Application Configuration Format

For _roc-config_ to understand a `roc.config.js` file in a project this needs to export an object with a `config` key.

## Examples

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
