## 1.4.3 (April 27, 2017)

- normalize file path on windows (fixed #14, thanks to @lahmatiy)
- fix issue with scrollbars on body on windows (@lahmatiy)

## 1.4.2 (April 12, 2017)

- bump rempl version

## 1.4.1 (April 8, 2017)

- bump rempl version
- support new rempl environment implementation

## 1.4.0 (April 4, 2017)

### Plugin

- get original position of module require
- remove webpack from dependencies

### UI

- move openInEditor to transport
- support original position of module require

## 1.3.1 (March 31, 2017)

### Plugin

- fix possible crash

## 1.3.0 (March 31, 2017)

### Plugin

- bump rempl version
- generate file/module links
- integration with [open-in-editor](https://github.com/lahmatiy/open-in-editor/)
- fix bug when the plugin is working only in NON-watch mode when watchModeOnly is false

### UI

- rename `env` page to `details`
- add filter text input to details page
- add table mode switcher to details page
- rework status bar
- rework bottom bar
- file map now display all module files (ignore `hide 3rd party` option)
- rework tooltip on file map

## 1.2.0 (March 25, 2017)

### Plugin

- bumped rempl version
- fixed a bug with multiple subscribing on compilation events after every building
- rempl server was integrated into the plugin (closes #4)
- open UI automatically
- generate modules links
- generate retained module info
- generate exclusive module info

### UI

- old webtree replaces by FoamTree (closes #11)
- added split view
- some cleanup
- support rempl env
- added env page
- added bottom bar
- receiving editing file path from the env
- sending editing file modules info to the env

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
