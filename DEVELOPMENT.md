# Development
If you wish to contribute to the Roc core and supported ecosystem as a developer you should set up and link the appropriate packages locally. This document aims to help with this process.

## Setting up locally
TODO

## Debug
You can enable debug output in Roc by specifying the appropriate regexp in `DEBUG` environment variable.

All Roc related output:  
`DEBUG=roc* roc ...`

Roc core only:  
`DEBUG=roc:(bin|cli|commands|configuration|hooks)* roc ...`
