# No Module Deopts

Ensures that bundle doesn't have modules with deoptimization

Fails validation if some modules have deoptimization reason (can't concatenate modules, etc).

## Example

```json
{
  "no-modules-deopts": ["error"]
}
```

**Output:**

```
- ❌ Module ./foo.js has deoptimizations
```

## Options

```ts
type Options = {
  exclude?: Array<
    string |
    RegExp |
    {
      type: 'compilation' | 'module';
      name: string;
    }
  >
}
```

### exclude

Specify modules name or compilations name that must be ignored by the rule.

**Exclude by package name:**
```json5
{
  "no-packages-dups": [
    "error",
    {
      "exclude": ["./foo.js"] // or regexp
    }
  ]
}
```

There are no errors, even if `./foo.js` module has deoptimization

**Exclude by compilation name:**
```json5
{
  "no-packages-dups": [
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

There are no errors, even if `foo-compilation` has modules with deoptimizations
