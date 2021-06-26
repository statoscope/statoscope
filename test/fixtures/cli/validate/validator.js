/* eslint-env node */

module.exports = `
$master: .[name="astexp-1.json"];
$branch: .[name="astexp-2.json"];
[
  {
    assert: $branch.compilations.nodeModules.[name="lodash"].size() = 0,
    message: 'Lodash usage detected. Please do not use lodash in this project'
  },
  {
    $branchRXJS: $branch.compilations.nodeModules.[name="react"].instances.reasons.data.resolvedModule;
    $masterRXJS: $master.compilations.nodeModules.[name="react"].instances.reasons.data.resolvedModule;
    
    assert: $branchRXJS.size() <= $masterRXJS.size(),
    message: 'More rxjs usage detected. Bad :('
  }
]
`;
