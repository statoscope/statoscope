# Restricted packages

Ensures that bundle doesn't use specified packages.

Fails validation if some of specified packages has used by the bundle.

## Example

```json5
{
  "restricted-packages": [
    "error",
    [
      "lodash",
      "rxjs@<6.0.0"
    ]
  ]
}
```

In this example there are two restricted packages - `lodash` and `rxjs` version prior 6.

**Output:**

```
- ❌ lodash should not be used
- ❌ rxjs@5.1.0 should not be used
```

## Options

```ts
type Options = Array<
  string |
  RegExp |
  { name: string | RegExp, version?: string }>
```

### string or RegExp

```json5
{
  "restricted-packages": [
    "error",
    [
      'foo-package',
      '@bar/package@1.0.0 - 4.0.0'
    ]
  ]
}
```

`@...` is a version or [semver](https://www.npmjs.com/package/semver) range.

### object

```json5
{
  "restricted-packages": [
    "error",
    [
      'foo-package',
      {
        name: '@bar/package',
        vesrion: '1.0.0 - 4.0.0',
      }
    ]
  ]
}
```

`version` is a version or [semver](https://www.npmjs.com/package/semver) range.
