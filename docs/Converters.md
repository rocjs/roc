# Converters

Converters are used in the CLI context. CLI extensions could use converters
to convert the input value from your command option to the correct value your extension expects.

## Usage

### automatic
If you don't provide one it'll be provided for you.


### convert
Will convert to the first valid converter you pass to the function.  
It's also possible to provide a custom converter. See example.

Command
```bash
$ roc yourCliCommand --yourOption='true'
$ roc yourCliCommand --yourOption=100
```

Output
```js
true
1000
```

Code
```js
import { convert, toBoolean, toInteger } from 'roc/converters';

// ... meta object
converters: {
    dev: {
        yourCliCommand: {
            yourOption: convert(toBoolean, toInteger)
        }
    }
}
// ... end meta object
```

Custom converter
```js
import { convert } from 'roc/converters';

const customConverter => (input) => {
    if (input === 'something') {
        return true;
    }

    return false;
};

// ... meta object
converters: {
    dev: {
        yourCliCommand: {
            yourOption: convert(customConverter)
        }
    }
}
// ... end meta object
```


### toArray
Will convert the input to an array.

Command
```bash
$ roc yourCliCommand --yourOption=1,2,3,4
$ roc yourCliCommand --yourOption='[1, 2, 3, 4]'
```

Output
```js
[1, 2, 3, 4]
```

Code
```js
import { toArray } from 'roc/converters';

// ... meta object
converters: {
    dev: {
        yourCliCommand: {
            yourOption: toArray
        }
    }
}
// ... end meta object
```

### toBoolean
Will convert the input to a boolean or return the default value
if convertion fails.

Command
```bash
$ roc yourCliCommand --yourOption=true
$ roc yourCliCommand --yourOption='false'
$ roc yourCliCommand --yourOption='true'
$ roc yourCliCommand --yourOption=100
$ roc yourCliCommand --yourOption
$ roc yourCliCommand --no-yourOption
```

Output
```js
true
false
true
undefined
true
false
```

Code
```js
import { toBoolean } from 'roc/converters';

// ... meta object
converters: {
    dev: {
        yourCliCommand: {
            yourOption: toBoolean
        }
    }
}
// ... end meta object
```

### toInteger
Will convert the input value to a number or return NaN if is not valid.

Command
```bash
$ roc yourCliCommand --yourOption=100
$ roc yourCliCommand --yourOption='100'
$ roc yourCliCommand --yourOption='string'
```

Output
```js
100
100
NaN
```

Code
```js
import { toInteger } from 'roc/converters';

// ... meta object
converters: {
    dev: {
        yourCliCommand: {
            yourOption: toInteger
        }
    }
}
// ... end meta object
```

### toObject
Will convert the input value to an object.

Command
```bash
$ roc yourCliCommand --yourOption='{}'
```

Output
```js
{}
```

Code
```js
import { toObject } from 'roc/converters';

// ... meta object
converters: {
    dev: {
        yourCliCommand: {
            yourOption: toObject
        }
    }
}
// ... end meta object
```

### toRegExp
Will convert the input value to a RegExp.

Command
```bash
$ roc yourCliCommand --yourOption='myRegExp'
```

Output
```js
/myRegExp/
```

Code
```js
import { toRegExp } from 'roc/converters';

// ... meta object
converters: {
    dev: {
        yourCliCommand: {
            yourOption: toRegExp
        }
    }
}
// ... end meta object
```
