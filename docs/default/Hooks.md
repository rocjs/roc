# Hooks for `roc`

## Hooks
* [roc](#roc)
  * [update-settings](#update-settings)

## roc

### update-settings

Expected to return new settings that should be merged with the existing ones.

__Initial value:__ _Nothing_  
__Expected return value:__ `{}`

#### Arguments

| Name        | Description                                                                  | Type       |
| ----------- | ---------------------------------------------------------------------------- | ---------- |
| getSettings | A function that returns the settings after the context has been initialized. | `Function` |
