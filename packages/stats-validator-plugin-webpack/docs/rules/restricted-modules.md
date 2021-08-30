# Restricted to use of specified dependencies

Ensures that bundle doesn't use specified modules.

Fails validation if some of specified modules have used by the bundle.

## Example

**Rule:**

```json5
{
  "restricted-modules": [
    "error",
    ["./foo-module.js", "./bar-module.js"]
  ]
}
```

**Output:**

```
- ❌ Module ./foo-module.js should not be used
- ❌ Module ./bar-module.js should not be used
```

## Options

```ts
type Options = Array<
  string |
  RegExp
>
```

### string

```json5
{
  "restricted-modules": [
    "error",
    [
      './foo-module.js',
      './bar-module.js'
    ]
  ]
}
```

> Module name should be specified relative compilation context

> Sometimes webpack 4 uses an absolute path for a module name, therefore using regexp as a module name is more flexible

### RegExp

Specify restricted module.

```json5
{
  "restricted-modules": [
    "error",
    [/foo-module\.js/, /\/some-dir\//]
  ]
}
```
