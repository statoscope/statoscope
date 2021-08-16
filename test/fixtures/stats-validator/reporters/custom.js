/* eslint-env node */

module.exports = class CustomReporter {
  constructor(options) {
    this.options = options;
  }
  run(result) {
    console.log(this.options);

    for (const rule of result.rules) {
      for (const error of rule.api.getStorage()) {
        console.log(error.message);
      }
    }
  }
};
