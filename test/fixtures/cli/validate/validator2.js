/* eslint-env node */

module.exports = function (data, api) {
  const masterStats = data.query('.[name="astexp-1.json"]');
  const branchStats = data.query('.[name="astexp-2.json"]');
  const branchLodashUsage = data.query(
    'compilations.nodeModules.[name="lodash"]',
    branchStats
  );

  if (branchLodashUsage.length) {
    api.error('Lodash usage detected. Please do not use lodash in this project');
  }

  const masterRXJSUsage = data.query(
    'compilations.nodeModules.[name="react"].instances.reasons.data.resolvedModule',
    masterStats
  );
  const branchRXJSUsage = data.query(
    'compilations.nodeModules.[name="react"].instances.reasons.data.resolvedModule',
    branchStats
  );

  if (branchRXJSUsage.length < masterRXJSUsage.length) {
    api.info('Less rxjs usage detected. Cool :)');
  } else if (branchRXJSUsage.length > masterRXJSUsage.length) {
    api.error('More rxjs usage detected. Bad :(');
  }
};
