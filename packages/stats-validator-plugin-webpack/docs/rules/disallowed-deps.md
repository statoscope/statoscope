# Disallow to use of specified dependencies

Fail validation if some of the specified dependencies (module or package) are used by the bundle.

## Example

```json
{
  "disallowed-deps": [
    "error",
    [
      "lodash",
      "rxjs@<6.0.0"
    ]
  ]
}
```

In this example there are two disallowed dependencies - `lodash` and `rxjs` version prior 6.

## Options

```ts
Array<
  string |
  RegExp |
  { type: 'module', name: string | RegExp } |
  { type: 'package', name: string | RegExp, version?: string }>
```

### string

Specify disallowed package or module, depends on string content.

If dependency name is a relative path (starts from `.`) it treats as a module:

```js
['./foo-module.js', './bar-module.js']
```

> Module name should be specified relative compilation context

> Sometimes webpack 4 uses an absolute path for a module name, therefore using regexp as a module name is more flexible (see below)

If dependency name is not a relative path, it treats as a package:

```js
['foo-package', '@bar/package']
```

Also, there is an extra syntax for a package: `name@version`

- `name` - package name
- `version` - package version (version or [semver](https://www.npmjs.com/package/semver) range)

```js
['foo-package@<3.0.0', '@bar/package@1.0.0 - 4.0.0']
```

### RegExp

Specify disallowed module.

```js
[/foo-module\.js/, /\/some-dir\//]
```

### ModuleDescriptor

`{ type: 'module', name: string | RegExp }`

Specify the disallowed module explicitly.

```js
[
  {type: 'module', name: './foo-module.js'},
  {type: 'module', name: /\.\/bar\/module\.js/},
]
```

### PackageDescriptor

`{ type: 'package', name: string | RegExp, version?: string }`

Specify the disallowed package explicitly.

```js
[
  {type: 'package', name: 'foo-package', version: '1.0.0 - 3.0.0'},
  {type: 'package', name: /^bar-/},
]
```
