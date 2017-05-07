Babel Plugin Logs Paths
======

A fork of [babel-plugin-meaningful-logs](https://github.com/furstenheim/babel-plugin-meaningful-logs) A babel plugin that enhances your logs by adding the file and the object logging.

## Installation
```sh
npm i babel-plugin-logs-paths --save-dev
```
or
```sh
yarn add babel-plugin-logs-paths --dev
```

### Usage
```javascript
console.log(b.length)
```

becomes

```javascript
console.log("pathToFile:2:8:b.length", b.length)
```

By default it modifies all console commands: console.error, console.log... But it can be customized. To modify all winstons logs the .babelrc file would be:

```
{
  plugins: [
    ['logs-paths',
    {loggers: [{pattern: 'winston'}]}
    ]
  ]
}
```



## Contribute

1. [Submit an issue](https://github.com/gordienkotolik/babel-plugin-logs-paths/issues)
2. Fork the repository
3. Create a dedicated branch (never ever work in `master`)
4. The first time, run command: `yarn` into the directory
5. Fix bugs or implement features



## License
This project is licensed under the terms of the
[MIT license](https://github.com/gordienkotolik/babel-plugin-logs-paths/blob/master/LICENSE)