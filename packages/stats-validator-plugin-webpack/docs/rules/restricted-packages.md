# Restricted Packages Rule

Ensures that bundle doesn't include specified packages.
Fails validation if some of specified packages are used by the bundle.

## Example

```json5
{
  "@statoscope/webpack/restricted-packages": [
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
Rule options is a list of package targets.

```ts
type Options = Array<
  string |
  RegExp |
  {
    name: string | RegExp, // package name or regular expression
    version?: string, // version being deprecated
    description?: string, // description of the target
    alternatives?: string[], // list of alternative packages which could be used instead
  }>
```

### Target can be defined as a string or regular expression

```json5
{
  "@statoscope/webpack/restricted-packages": [
    "error",
    [
      'foo-package', // package name
      '@bar/foo@1.1.1', // package name and particular version
      '@bar/package@1.0.0 - 4.0.0' // package name & version range
    ]
  ]
}
```

### Target can be defined as an object

Rule match fields
- `name: string | RegExp` - Deprecated package name or regular expression matching the name.
- `version?: string` - Deprecated [version](https://www.npmjs.com/package/semver) or version range.
  Optional field. When provided only presence of packages with version(s) defined here will fail
  validation.
- `description?: string` - Optional human-readable description for the target.
  When provided will be printed out on the rule match.
- `alternatives?: string[]` - Optional list of alternative packages to be suggested on the rule match.

```json5
{
  "@statoscope/webpack/restricted-packages": [
    "error",
    [
      'foo-package',
      {
        name: '@bar/package',
        vesrion: '1.0.0 - 4.0.0',
        description: 'Deprecated due to severe security vulnerability',
      }, {
        name: 'original-dojo',
        description: 'Package is not maintained',
        alternatives: ['react'],
      }
    ]
  ]
}
```

**Output:**

```
- ❌ foo-package@1.1.1 should not be used
- ❌ @bar/package@1.1.1 should not be used
    Deprecated due to severe security vulnerability
- ❌ original-dojo@1.1.1 should not be used
    Package is not maintained
    Consider using alternative packages:
    - react
```
