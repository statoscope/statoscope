# Diff Deprecated Packages

Compares usage of specified packages between input and reference stats.

Fails if the input stats has more specified packages usage than reference.

Package usage is just the total imports of a package in your bundle. If you add more imports of a deprecated package then you increase its usage.

## Example

```json5
{
  "@statoscope/webpack/diff-deprecated-packages": ["error", ['lodash']]
}
```

**Output:**

```
- ❌ Usage of lodash was increased from 801 to 865
```

## Options

```ts
type Options = Array<string | RegExp> |
  {
    target: Array<string | RegExp>;
    exclude?: Array<string | RegExp>
  }
```

### Array<string | RegExp>

Treats as `target: Array<string | RegExp>` (see below)

### target

Specify packages which usage must be compared

```json5
{
  "@statoscope/webpack/diff-deprecated-packages": [
    "error",
    [
      /lodash/,
      'rxjs@<6.0.0'
    ]
  ]
}
```

Fails if:
- usage of `rxjs`-package with version prior 6 has increased 
- or usage of any package with `lodash` in its name, has increased

`@...` is a version or [semver](https://www.npmjs.com/package/semver) range.

### exclude

Specify compilation **names** that must be ignored by rule.

```json5
{
  "@statoscope/webpack/diff-deprecated-packages": [
    "error",
    {
      "exclude": ["foo-compilation"] // or regexp
    }
  ]
}
```

There are no errors, even if specified packages usage withing `foo-compilation` has increased
