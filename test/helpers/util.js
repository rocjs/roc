export const makeGetterSpy = function(obj, getter) {
    let callCount = 0;

    // store reference to old getter for restore
    const oldGetter = obj.__lookupGetter__(getter);

    if (!oldGetter) {
        throw new Error('Attempted to add getter spy to unsupported attribute');
    }

    // define spy getter
    Object.defineProperty(obj, getter, {
        get: function() {
            callCount++;
            return oldGetter.call(obj);
        },
        configurable: true
    });

    return {
        called: function() {
            return callCount > 0;
        },
        callCount: function() {
            return callCount;
        },
        restore: function() {
            Object.defineProperty(obj, getter, {
                get: oldGetter,
                configurable: true
            });
        }
    };
};
