/* eslint-env jest, node */
const originalChalk = jest.requireActual('chalk');
module.exports = new originalChalk.Instance({ level: 0 });

module.exports.Instance = function (options) {
  options = options || {};
  options.level = 0;
  return new originalChalk.Instance(options);
};
