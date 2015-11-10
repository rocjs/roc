# roc-config

Configuration manager for the Roc ecosystem.

## Notes

Important to note is that the this project will look for two environment variables; `ROC_CONFIG` and `ROC_CONFIG_OBJECT`. If either of them are found they will be used over what has been set during runtime. Please read the documentation to understand how this works in more detail. However if there is a conflict, both a environment variable is set and something manually, there will a a clear warning given to the user.

## Documentation

To generate documentation please run `npm run docs`.
