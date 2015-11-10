# roc-config

Configuration manager for the Roc ecosystem.

## Notes

Important to note is that the this project will look for two environment variables; `ROC_CONFIG` and `ROC_CONFIG_OBJECT`. If either of them are found they will be used over what has been set during runtime. Please read the documentation to understand how this works in more detail. However if there is a conflict, both a environment variable is set and something manually, there will a a clear warning given to the user.

Once imported to your project the configuration and all its internal states will persist throughout the process lifetime.

## Documentation

To generate documentation please run `npm run docs`.

## Examples

Use default configuration:
```js
import { getFinalConfig } from 'roc-config';

const config = getFinalConfig();

```

Extend default configuration with custom configuration and use it:
```js
import { getFinalConfig } from 'roc-config';

const customConfig = {
    property: 'value'
};

const config = getFinalConfig(customConfig);
```
Perform multiple modifications and use:
```js
import { getFinalConfig, setTemporaryConfig } from 'roc-config';

// deep merges parameter to current temporary configuration state
setTemporaryConfig({
    value: 'value'
});

setTemporaryConfig({
    value2: 'value2'
});

// config will hold { "value": "value", "value2": "value2" }
const config = getFinalConfig();
```
