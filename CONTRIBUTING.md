## Semantic commit messages

Please, use semantic commit message:

`type(scope): message`

or

`type: message`

Types are:

- `build` - code build changes (webpack config, etc)
- `ci` - CI changes (GitHub actions, CI scripts)
- `docs` - documentation changes
- `feat` - new features
- `fix` - bug fixes
- `perf` - performance improvements
- `refactor` - code refactoring (also types changes)
- `style` - code style changes (also eslint/prettier config changes)
- `test` - add/fix/remove tests, or change jest configuration
- `chore` - everything else

The scope is a package name that changes related to.

For example:

`test(cli): add foo command`

or

`docs: fix root readme typos`
