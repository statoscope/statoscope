/* eslint-env node */

const reportA = require('../injectReport/reports/single-report-a.json');
const reportB = require('../injectReport/reports/single-report-b.json');

const config = {
  reports: [reportA, reportB],
};

module.exports = config;
