# Validators

Roc offers validators that can be used to make sure values have the correct value in different cases.

**Table of Contents**
* [Where are validators used?](#where-are-validators-used)
  * [Commands](#commands)
  * [Meta Settings](#meta-settings)
  * [Hooks](#hooks)
* [Default Validators](#default-validators)
	* [RegExp](#regexp)
  * [isArray](#isarray)
  * [isBoolean](#isboolean)
  * [isFunction](#isfunction)
  * [isInteger](#isinteger)
  * [isObject](#isobject)
  * [isPath](#ispath)
  * [isPromise](#ispromise)
  * [isRegExp](#isregexp)
  * [isString](#isstring)
  * [notEmpty](#notempty)
  * [oneOf](#oneof)
  * [required](#required)
* [Custom Validators](#custom-validators)
* [infoObject](#infoobject)

## Where are validators used?

Validators are currently used at three places in Roc:
1. Commands
2. Meta Settings
3. Hooks

### Commands
```javascript
commands: {
    build: {
        // ...
        arguments: [{
            // ...
            validator: isString
        }],
        options: [{
            // ...
            validator: isString
        }]
    }
}
```

### Meta Settings
```javascript
settings: {
    build: {
        someValue: {
            // ...
            validator: isString
        }
    }
}
```

### Hooks
```javascript
hooks: {
    'before-hook': {
        // ...
        arguments: [{
            // ...
            validator: isString
        }],
        returns: isFunction
    }
}
```

## Default Validators

All validators will have the same basic syntax.
```javascript
// a validator
(input, info) => true, false/ERROR_MESSAGE, `infoObject`
```

If the second argument, info above, is set to true an `infoObject` will be returned and no validation will be performed. This `infoObject` is used in documentation generation, [more info about it can be found below.](#infoObject) If `info` is not defined or set to false a normal validation will be performed resulting in the function either returning `true` as the input was valid or `false` / an error message if not valid.

### RegExp
A RegExp is considered a valid validator and can be used both as it is and together with another validator.

__Example__
```javascript
import { isArray } from 'roc/validators';

// A validator that allows an array that contains either "node" or "web"
const validator = isArray(/node|web/)
```

### `isArray`
```javascript
import { isArray } from 'roc/validators';

isArray(/* possible validator */) => validator
```
Will validate the input to make sure it’s an array consisting of the possible validator as values.

`null` and `undefined` are valid.

__Example__
```javascript
import { isArray, isBoolean } from 'roc/validators';

// Will validate that the input is an array of booleans
// [true, true, true] : valid
// [true, 1, true] : not valid
isArray(isBoolean) => validator
```

### `isBoolean`
```javascript
import { isBoolean } from 'roc/validators';
```
Will validate the input to make sure it’s a boolean.

`null` and `undefined` are valid.

### `isFunction`
```javascript
import { isFunction } from 'roc/validators';
```
Will validate the input to make sure it’s a function.

`null` and `undefined` are valid.

### `isInteger`
```javascript
import { isInteger } from 'roc/validators';
```
Will validate the input to make sure it’s an integer.

`null` and `undefined` are valid.

### `isObject`
```javascript
import { isObject } from 'roc/validators';

isObject(/* possible validator */, options) => validator
isObject(options) => validator
```
Will validate the input to make sure it’s an object consisting of the possible validator for values. Possible to provide an options object that can be the first argument if no validator is used or the second if a validator is used.

`null` and `undefined` are valid.

__`options`__  
```
unmanaged       Defaults to false, Roc will not check for mismatches in projects when true.
```

If `unmanaged` is set to `true` the object will not be managed, meaning that Roc will not verify the object keys in this case. This is useful if the value for the specific property should be treated as an object.

__Example__
```javascript
import { isObject, isBoolean } from 'roc/validators';

// Will validate that the input is an object with booleans as values
// { a: true, b: true } : valid
// { a: true, b: 1 } : not valid
isObject(isBoolean, { unmanaged: false }) => validator
```

### `isPath`
```javascript
import { isPath } from 'roc/validators';
```
Will validate the input to make sure it’s a file path.

`null` and `undefined` are valid.

### `isPromise`
```javascript
import { isPromise } from 'roc/validators';
```
Will validate the input to make sure it’s a promise.

`null` and `undefined` are valid.

### `isRegExp`
```javascript
import { isRegExp } from 'roc/validators';
```
Will validate the input to make sure it’s a regular expression.

`null` and `undefined` are valid.

### `isString`
```javascript
import { isString } from 'roc/validators';
```
Will validate the input to make sure it’s a string.

`null` and `undefined` are valid.

### `notEmpty`
```javascript
import { notEmpty } from 'roc/validators';
```
Will validate the input to make sure it’s not empty. The length of arrays and strings must be more than 0 and an object need to have at least one key.

`null` and `undefined` are valid.

### `oneOf`
```javascript
import { oneOf } from 'roc/validators';

oneOf(...validators) => validator
```

Will validate the input to be valid against on of the provided validators.

__Example__
```javascript
import { oneOf, isString, isArray } from 'roc/validators';

// Will validate that the input is either a string or an array of strings
oneOf(isString, isArray(isString)) => validator
```

### `required`
```javascript
import { required } from 'roc/validators';

required(/* possible validator */) => validator
```
Will validate that the input is __not__ `null` or `undefined` along with the additional validator.

__Example__
```javascript
import { required, isString } from 'roc/validators';

// Will validate that the input is either a string and that it is defined, not null or undefined
required(isString) => validator
```

## Custom Validators

It’s of course also possible to define custom validators if one of the default ones does not cover the specific use case. A validator is a function that takes in a value and returns `true` if the value was valid and `false` / an error string / an error object if it was not. Custom validators can be combined with default validators for more complex behavior.

An important thing is to make sure that a validator always returns a value for it to function correctly. It’s also encouraged that custom validators have support for generating an `infoObject` that will be used for documentation purposes, error messages and in some cases converting values. [Read more below.](#infoObject)

### Error object
For more complex validators one might need to return an error object instead of `false` / error string. This error object can be used to provide better information to user of Roc about exactly where the error occurred. The object can contain 3 properties; `key`, `value` and `message`.

```
key         An additional key that should be added to where the error happened.
value       The value that got the error.
message     The error message, what another validator might have returned as an error string.
```

__Example__
```javascript
import { oneOf, isBoolean, createInfoObject } from 'roc/validators';

const customValidator => (input, info) => {
    if (info) {
        return {
            type: 'My custom type'
        };
    }

    if (input === 'something') {
        return true;
    }

    return 'Was not "something"!';
};

oneOf(customValidator, isBoolean) => validator
```

## `infoObject`

The `infoObject` is mainly used when generating documentation and giving feedback to the user from the command line. It’s an object that have information about the possible values that a validator accepts and it’s expected to be returned when the validator is called with the first argument defined to `null` and the second as `true`.

```
type             The type as a string to use for documentation and feedback.
canBeEmpty       Boolean that states if the value can be empty. The length of arrays and strings must be more than 0 and an object need to have at least one key.
required         Boolean that states if the value is required, that it can't be null or undefined.
converter        The converter to use as a fallback if one is not defined directly. See more in the documentation for converters.
unmanagedObject  Boolean that states if the value should be processed as an unmanaged object.
```
