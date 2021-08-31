# Diff Deprecated Modules

Compares usage of specified modules between input and reference stats.

Fails if the input stats has more specified modules usage than reference.

Module usage is just the total imports of a module in your bundle. If you add more imports of a deprecated module then you increase its usage.

## Example

```json5
{
  "@statoscope/webpack/diff-deprecated-modules": ["error", [/lodash/]]
}
```

**Output:**

```
- ❌ Usage of ./node_modules/lodash/unescape.js was increased from 2 to 5
- ❌ Usage of ./node_modules/lodash/isArguments.js was increased from 3 to 5
- ❌ Usage of ./node_modules/lodash/_stackSet.js was increased from 0 to 3
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

Specify modules which usage must be compared

```json5
{
  "@statoscope/webpack/diff-deprecated-modules": [
    "error",
    [
      "./node_modules/lodash/unescape.js",
      /rxjs/
    ]
  ]
}
```

Fails if:
- usage of `./node_modules/lodash/unescape.js` module has increased
- or usage of modules with `rxjs` in their name has increased

### exclude

Specify compilation **names** that must be ignored by rule.

```json5
{
  "@statoscope/webpack/diff-deprecated-modules": [
    "error",
    {
      "exclude": ["foo-compilation"] // or regexp
    }
  ]
}
```

There are no errors, even if specified modules usage withing `foo-compilation` has increased
