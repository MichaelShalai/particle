const {BigQuery} = require('@google-cloud/bigquery');
const colors = require('colors')
const {gcloudConfig} = require('./config.js');

const tableInsertOptions = { raw: true };

/* Wrap all interactions with BigQuery in this helper class */
class MyBigQuery {
	constructor() {
		process.stdout.write(colors.magenta('Initializing BigQuery with Google Cloud... '))
		this._api = new BigQuery({
		  projectId: gcloudConfig.projectId,
		  keyFilename: gcloudConfig.serviceAccountKeyFilePath,
		});

		/* SHORTCUT TO BIGQUERY TABLE */
		this._table = this._api
		  .dataset(gcloudConfig.bigqueryDatasetId)
		  .table(gcloudConfig.bigqueryTableId);

		console.log(colors.magenta('done!'))
	}

	insert(row) {
		return this._table.insert(row, tableInsertOptions);
	}

  async data() {
    const dataQuery = `
      SELECT
        ts,
        c_rolling_avg_5_minutes as c,
        h_rolling_avg_5_minutes as h
      FROM \`smart-home-226503.particle.reading_dashboard\`
    `;
    const dataQueryOptions = {
      query: dataQuery,
      // Location must match that of the dataset(s) referenced in the query.
      location: 'US',
    };
    const [rows] = await this._api.query(dataQueryOptions);
    return rows;
  }
}

module.exports = {
  MyBigQuery
};
