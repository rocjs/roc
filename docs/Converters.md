# Converters

Roc offers some converters that can be used to make sure some input has the correct form when using the command line. This since the command line will most often give string values for everything and sometimes that is not what is desired.

**Table of Contents**
* [Where are converters used?](#where-are-converters-used)
  * [Commands](#commands)
  * [Meta Settings](#meta-settings)
* [Default Converters](#default-converters)
  * [automatic](#automatic)
  * [convert](#convert)
  * [toArray](#toArray)
  * [toBoolean](#toBoolean)
  * [toInteger](#toInteger)
  * [toObject](#toObject)
  * [toRegExp](#toRegExp)
  * [toString](#toString)
* [Custom Converters](#custom-converters)

## Where are converters used?

Converters are used in two places in Roc:
1. Commands
2. Meta Settings

### Commands
```javascript
commands: {
    build: {
        // ...
        arguments: [{
            // ...
            default: 'Hello World',
            validator: isString,
            converter: toString
        }],
        options: [{
            // ...
            default: false,
            validator: isBoolean,
            converter: toBoolean
        }]
    }
}
```

The following strategy is used when trying to find the converter:
1. Use the `converter` that is defined directly on the object from the property.
2. Use the `validator` and try to find a converter from it since `infoObject` can return a converter.
3. Use the `default` value if present together with the automatic converter.
4. Do not convert.

This means that it is not mandatory to define a converter and Roc will do the best it can to select a fitting one if none is provided. 

### Meta Settings
```javascript
settings: {
    build: {
        someValue: {
            // ...
            validator: isString,
            converter: toString
        }
    }
}
```

The following strategy is used when trying to find the converter:
1. Use the `converter` that is defined directly on the object.
2. Use the `validator` and try to find a converter from it since `infoObject` can return a converter.
3. Use the value that is defined in the non meta settings together with the automatic converter.

This means that it is not mandatory to define a converter and Roc will do the best it can to select a fitting one if none is provided.

## Default Converters

All converters will have the same syntax.
```javascript
// a converter
(input) => convertedValue
```

### `automatic`
```javascript
import { automatic } from 'roc/converters';

automatic(value) => converter
```
Takes in a value and returns a converter. Will most likely not be needed to be defined manually.

### `convert`
```javascript
import { convert } from 'roc/converters';

convert(...converters) => converter
```
Takes in a number of converters and returns a single converter.

Will convert to the first valid converter you pass to the function or undefined.

__Example__
```javascript
import { convert, toBoolean, toInteger } from 'roc/converters';

convert(toBoolean, toInteger) => converter
```

### `toArray`
```javascript
import { toArray } from 'roc/converters';

toArray(/* possible converter */) => converter
```
Take in a possible converter and returns a converter that will transform the input to an array.

__Example__
```javascript
import { toArray, toBoolean } from 'roc/converters';

// Will convert input to an array of booleans
toArray(isBoolean) => converter
```

### `toBoolean`
```javascript
import { toBoolean } from 'roc/converters';
```
Will convert the input to a boolean if possible or return undefined.

### `toInteger`
```javascript
import { toInteger } from 'roc/converters';
```
Will convert the input value to a number or return NaN if not valid.

### `toObject`
```javascript
import { toObject } from 'roc/converters';
```
Will convert the input value to an object by trying to do `JSON.parse` on it.

### `toRegExp`
```javascript
import { toObject } from 'roc/converters';
```
Will convert the input value to a RegExp.

### `toString`
```javascript
import { toString } from 'roc/converters';
```
Will convert the input value to a string.

## Custom Converters

It is of course also possible to define custom converters if one of the default ones does not cover the specific use case.

A converter is just a function that takes in one value and returns the correct value. Custom converters can be combined with default converters for more complex behavior.

__Example__
```javascript
import { convert, toBoolean } from 'roc/converters';

const customConverter => (input) => {
    if (input === 'something') {
        return true;
    }

    return false;
};

convert(customConverter, toBoolean) => converter
```
