# Logging
Roc provides a utility for extensions that can be used to log things to the console, keeping output consistent across all the different packages and plugins.

## How to use
There is two ways to use the logging function from Roc. Either by using the function that is provided on the main export, [as seen here](/docs/API.md#initlog) or by importing it directly as below.

```javascript
import initSmall from 'roc/log/small';
import initLarge from 'roc/log/large';
import initLog from 'roc/log';

import smallDefault from 'roc/log/default/small';
import largeDefault from 'roc/log/default/large';
import initLogDefault from 'roc/log/default';
```

## Large
![large](/docs/assets/large_log.png)  
_A large error message_

Used for large messages.

### Types
When having a logger each of the types can be used as a property. The logging function takes in a message as the first argument. The second and the third arguments are optional and can be in any order. An optional `Error` and a label text as a string. If `verbose` is enabled the `error.stack` will be displayed, otherwise just `error.message`.

__Example__
```javascript
import initLarge from 'roc/log/large';

const log = initLarge(packageJSON.name, packageJSON.version);

log.error('Some message', 'Label Text Override', potentialError);
```

#### `info`
Output: `console.info`  
Color: `cyan`  
Label: Info

#### `note`
Output: `console.info`  
Color: `cyan`  
Label: Notice

#### `warn`
Output: `console.warn`  
Color: `yellow`  
Label: Warning

#### `error`
Output: `console.error`  
Color: `red`  
Label: Error

#### `ok`
Output: `console.log`  
Color: `green`  
Label: Ok

#### `success`
Output: `console.log`  
Color: `green`  
Label: Success

#### `raw`
Used to specify a logger function on `console`. First argument should be a string that can be either `info`, `warn`, `error` or `log`. The second argument is is the default label text.

```javascript
log.raw('info', 'Information')('a message', potentialError);
```

## Small
![small](/docs/assets/small_log.png)  
_A small info message_

Used for small messages.

### Types
Several modes exists that can be used.

When having a logger each of the types can be used as a property. The logging function takes in a message as the first argument and an optional `Error` as the second argument and the third is a boolean that determines if a potential symbol should be shown, default to `true`. If `verbose` is enabled the `error.stack` will be displayed, otherwise just `error.message`.

__Example__
```javascript
import initSmall from 'roc/log/small';

const log = initSmall(packageJSON.name, packageJSON.version);

log.error('Some message', potentialError, showSymbol);
```

#### `info`
Output: `console.log`  
Color: Default

#### `note`
Output: `console.info`  
Color: `cyan`  
Symbol: `ℹ`

#### `warn`
Output: `console.warn`  
Color: `yellow`  
Symbol: `⚠`

#### `error`
Output: `console.error`  
Color: `red`  
Symbol: `✖`

#### `ok`
Output: `console.log`  
Color: `green`

#### `success`
Output: `console.log`  
Color: `green`  
Symbol: `✔`

#### `raw`
Used to specify a logger function on `console`. First argument should be a string that can be either `info`, `warn`, `error` or `log`. The second argument is an optional color from [`chalk`](https://www.npmjs.com/package/chalk). The third argument is an optional symbol to show in front of the message.

```javascript
log.raw('info', 'blue', '🦄')('a message', potentialError, showSymbol);
```
