
# No packages duplicates

Ensures that bundle hasn't package duplicates.

Fails validation if some packages have more than one instance (directory with a package within `node_modules`).

## Example

Assume that we have two instances for the `foo`-package:

- `node_modules/foo`
- `node_modules/bar/node_modules/foo`

**Rule:**

```json
{
  "@statoscope/webpack/no-packages-dups": ["error"]
}
```

**Output:**

```
- ❌ Package foo has 2 instances
```

## Options

```ts
type Options = {
  exclude?: Array<
    string |
    RegExp |
    {
      type: 'compilation' | 'package';
      name: string;
    }
  >
}
```

### exclude

Specify packages or compilations that must be ignored by the rule.

**Exclude by package name:**
```json5
{
  "@statoscope/webpack/no-packages-dups": [
    "error",
    {
      "exclude": ["foo"] // or regexp
    }
  ]
}
```

There are no errors, even if `foo` package has more than one instances

**Exclude by compilation name:**
```json5
{
  "@statoscope/webpack/no-packages-dups": [
    "error",
    {
      "exclude": [
        {
          "type": "compilation",
          "name": "foo-compilation" // or regexp
        }
      ]
    }
  ]
}
```

There are no errors, even if `foo-compilation` has packages with more than one instances

> Consider not to use exclude-option to make your bundle less excess
