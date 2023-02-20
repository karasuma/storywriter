## File description
+ build-action.bat<br/>
Batch file to build for windows.
+ home.json<br/>
Messages that shows in the entrance page.<br/>
Update require when it publish new version.

## Commands
```
// Prepare
$> yarn install

// Execute
$> yarn electron:serve

// Build (windows)
$> build-action.bat

// Build (any)
$> yarn electron:build
$> cp default.ysd ./dist_electron/[any directories]/
$> cp home.json ./dist_electron/[any directories]/

// Test
$> yarn jest:unit
// not "t"est:unit
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).
