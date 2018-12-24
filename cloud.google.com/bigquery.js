const {BigQuery} = require('@google-cloud/bigquery');
const colors = require('colors')
const gcloudConfig = require('./config.js');

console.log(colors.magenta('Initializing BigQuery with Google Cloud...'))
const bigquery = new BigQuery({
  projectId: gcloudConfig.projectId,
});
console.log(colors.magenta('Initializing successful!'))

module.exports = bigquery;