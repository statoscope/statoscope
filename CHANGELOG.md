## 1.1.0 (March 16, 2017)

### Plugin

- fixed loader-utils version (fixes #9)

### UI

#### Graph

- replaces d3-graph by vivagraph
- zooming graph with mouse/touchpad scrolling
- changing graph position with drag and drop on the white field.
- changing rendering speed by sliding speed slider
- pause/resume graph rendering with `space`-key

## 1.0.1 (March 3, 2017)

### Plugin

- added `onlyWatchMode` option (#8)
- bumped rempl version

## 1.0.0 (March 2, 2017)

### Plugin

- new module id
- improved file handling
- improved loader handling
- supported different module types
- now works only in watch-mode
- added more webpack 1.x capability

### UI

#### Core
- replaced `Source` by `Profile` entity
- improved entity loading: `Module`, `Chunk`, `Asset`
- added `ModuleLoader` entity
- improved `File` entity
- all files now is `File` entity
- split `Issue` entity to `Warning` and `Error` entities
- removed useless code form `utils`
- added `open` and `close` events to ui.Page class
- added `Hide 3rd party modules` button (closes #5)
- added some css prefixes for cross-browsing
- many other simplifies and removing useless code

#### ui.Menu

- universalize counter
- added sub-menu
- added dropdown-item
- added checkbox-item

#### ui.Tooltip

- markup improvements

### Pages

#### Graph

- supported and highlighted different module types
- added module type to tooltip

#### File map

- reworked path-building algorithm (fixed some bugs)

## 1.0.0-alpha5 (February 18, 2017)

- add webpack2 support!
- fix webpack version info
- some cleanup in code

## 1.0.0-alpha4 (February 10, 2017)

- layout rework
- bump rempl version
- fix loaders normalization bug

## 1.0.0-alpha3 (December 26, 2016)

- layout rework
- remove css bootstrap
- add dependency graph
- add modules type statistics
- fix file map size recalc
- remove useless css
- components refactoring

## 1.0.0-alpha2 (December 22, 2016)

- fix example building on windows

## 1.0.0-alpha1 (December 22, 2016)

- rename package and repo to `webpack-runtime-analyzer`
- add file map page to render file structure
- add error and warning pages
- exclude UI bundle from package (build on publish)
- bump rempl

## 0.1.7 (December 16, 2016)

- UI refactoring

## 0.1.5 (December 12, 2016)

- fix installation logic
- include bundle to package

## 0.1.4 (December 11, 2016)

- fix readme
- fix installation logic

## 0.1.3 (December 11, 2016)

- bump rempl version
- improve eslint config and fix warnings
- simplify plugin usage
- fix readme

## 0.1.2 (December 09, 2016)

- improve example webpack config

## 0.1.1 (December 09, 2016)

- fix remp require

## 0.1.0 (December 09, 2016)

### Added

- initial release
