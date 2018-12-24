/* APP ENGINE DEPENDENCIES */
require('@google-cloud/debug-agent').start();

/* APPLICATION DEPENDENCIES */
const gcloudConfig = require('./config.js');

/* MISC DEPENDENCIES */
const colors = require('colors')

/* INITIALIZATION */
const bigquery = require('./bigquery.js');
const pubsub = require('./pubsub.js');

/* SHORTCUT TO BIGQUERY TABLE */
let table = bigquery
  .dataset(gcloudConfig.bigqueryDatasetId)
  .table(gcloudConfig.bigqueryTableId);
const tableInsertOptions = { raw: true };

/* LISTEN FOR PUB/SUB EVENTS */
const subscription = pubsub.subscription(gcloudConfig.pubsubSubscriptionName);
subscription.on('message', message => {
    console.log(colors.cyan(`Particle event received from Pub/Sub. ID: ${message.id}. Length: ${message.length}. Data: ${message.data}.`));
    storeEventAndAck(message);
});

/* HANDLE A SINGLE PUB/SUB EVENT */
function storeEventAndAck(message) {
    let data = {};
    try {
      data = JSON.parse(message.data);
    } catch(err) {
      console.log(colors.red(err));
      return;
    }

    // message.attributes.device_id -- Particle device ID
    // message.attributes.published_at -- Timestamp
    // data -- Record
    //   c - Temperature, Celsius
    //   h - Humidity, %
    //
    // Other fields:
    // message.id -- Event ID.
    // message.attributes.event -- Particle event name.
    let obj = {
      device_id: message.attributes.device_id,
      published_at: message.attributes.published_at,
      data: data
    }

	var row = {
	  insertId: `${message.id}:${message.attributes.device_id}:${message.attributes.published_at}`,
	  json: obj
	};

    // console.log(colors.grey(`Reading time: ${message.attributes.published_at}. Readings: ${message.data}.`));

	table
	  .insert(row, tableInsertOptions)
	  .then(() => {
	  	// Acknowledge message receipt.
        message.ack();
	    // console.log(colors.grey('Insertion successful!'));
	  })
	  .catch(err => {
	    if (err && err.name === 'PartialFailureError') {
	      if (err.errors && err.errors.length > 0) {
	        console.log('Insertion errors:');
	        err.errors.forEach(err => console.error(err));
	      }
	    } else {
	      console.error('ERROR:', err);
	    }
	  });
}
/* END INITIALIZATION */

// Application startup.
const app = require('express')();

app.get('/liveness_check', (req, res) => {
});

app.get('/readiness_check', (req, res) => {
});

app.get('/', (req, res) => {
  res.send('Hello from App Engine!');
});

// Listen to the App Engine-specified port, or 8080 otherwise
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}...`);
});

