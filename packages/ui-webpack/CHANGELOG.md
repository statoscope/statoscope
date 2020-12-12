# Changelog

## Next

### Bugfix

- Fix resolving module resource that starts with `..`

## 3.2.0 (11 December 2020)

### Features

- Added webpack plugin

    Now you may use Statoscope as a webpack plugin:
    
    **webpack.config.js:**
    ```js
    const StatoscopeWebpackPlugin = require('@statoscope/ui-webpack');

    config.plugins.push(new StatoscopeWebpackPlugin());
    ```
  
    See the readme for more information.

### Misc

- Update [@discoveryjs/discovery](https://github.com/discoveryjs/discovery) to [1.0.0-beta.52](https://github.com/discoveryjs/discovery/blob/master/CHANGELOG.md#100-beta52-19-11-2020)

## 3.1.0 (01 December 2020)

### Features

- Goto first compilation when load multiple stats or a stat with multiple compilations

## 3.0.0 (01 December 2020)

### Features

- **[Breaking]**: Change data structure

    Now, Statoscope normalize the stats to a specific standardized structure.

    You can see it at [Make report](https://statoscope.tech/#report) page.
    
    Every stat has some basic info (filename, webpack version) and a list of the compilations.
    
    > The modules/chunks/assets are resolved now
    
    Statoscope init-function argument also changed:
    
    ```js
    import init from '@statoscope/ui-webpack';
    import stats from 'path/to/stats.json'
    
    init({
      name: "stats.json",
      data: stats
    });
    ```
    
- Stats diff
    
    Statoscope provides a tool to diff the stats.
    Load two or more stats to diff it.

- Support multiple stat files

    Now you can load multiple stats and switch between them.
    
- Support [multi-config](https://webpack.js.org/configuration/configuration-types/#exporting-multiple-configurations) projects

    If you have a multi-config project (e.g. client and server described in one config)
    then it will be splitter into a few compilations with possibility to switching between them.

- Rework main page dashboard

    Add some indicators:
    
    - `Total size` - size of all the assets of your bundle
    - `Initial size` - size of all the initial assets of your bundle
    - `Packages size` - size of all
    - `Duplicate modules` - total modules with the same source 
    - `Build Time`
    
    Remove chunk groups indicator
    
- Add duplicate module info
  
    Now you can see all the modules with the same source

- Add stats validation
- Add deopt block to a module page
- Add module issuer path
- improve filtration speed

### Bugfix

- Fix error in chunk packages list
- Fix incorrect chunks and modules filtration
- Fix packages list items limit

## 2.2.0 (30 October 2020)

### Features

- ctrl + click on foam-tree opens a package or module detail page,
- improved popup markup
- allow passing custom root element to init the UI
- add style-less dist

## 2.1.2 (29 October 2020)

### Bugfix

- correct parsing modules name with absolute path

## 2.1.1 (29 October 2020)

### Bugfix

- ignore top-level modules in stats and collect these by the chunks
- use original module name if can't normalize it
- fix exception when mouse leave a foam-tree

## 2.1.0 (29 October 2020)

### Features

- add modules reasons to the package tree

## 2.0.1 (29 October 2020)

### Bugfix

- fix module page when module id is number

## 2.0.0 (29 October 2020)

- brand new webpack analyzer, webpack-runtime-analyzer was deprecated
