/* APP ENGINE DEPENDENCIES */
require('@google-cloud/debug-agent').start();

/* APPLICATION DEPENDENCIES */
const {Auth} = require('./auth.js');
const {Logging} = require('./logging.js');
const {gcloudConfig} = require('./config.js');
const {MyBigQuery} = require('./bigquery.js');

/* MISC DEPENDENCIES */
const colors = require('colors');
const util = require('util');

/* INITIALIZATION */
const pubsub = require('./pubsub.js');
var auth = new Auth();
var log = new Logging();
var bigquery = new MyBigQuery();

/* HANDLE A SINGLE PUB/SUB EVENT */
function _storeEventAndAck(message) {
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

  bigquery
    .insert(row)
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
/* FORMAT RESPONSE DATA ROWS AS DATATABLE */
/// https://developers.google.com/chart/interactive/docs/reference#dataparam
function _formatAsDataTable(rows) {
  var cols = [
    /// FIGURE OUT HOW TO PASS `DATETIME` TYPE
    {"id":"time",   "label":"Time",                   "type":"string"},
    {"id":"c",      "label":"Temperature, Celsius",   "type":"number"},
    {"id":"h",      "label":"Humidity, %",            "type":"number"}
  ];

  var data = [];
  rows.forEach(function (row) {
    var values = [];
    Object.values(row).forEach(function (value) {
      values.push({v: value, f: null});
    });
    data.push({c: values});
  });
  return {
    cols: cols,
    rows: data
  };
}

/* START LISTENING FOR PUB/SUB EVENTS */
const subscription = pubsub.subscription(gcloudConfig.pubsubSubscriptionName);
subscription.on('message', message => {
  console.log(colors.cyan(`Particle event received from Pub/Sub. ID: ${message.id}. Length: ${message.length}. Data: ${message.data}.`));
  _storeEventAndAck(message);
});

/* END INITIALIZATION */

// Application startup.
const app = require('express')();

app.get('/liveness_check', (req, res) => {
});

app.get('/readiness_check', (req, res) => {
});

app.get('/data', (req, res, next) => {
  var id_token = req.query.id_token;
  if (!id_token) {
    throw new Error('Missing URL parameter: `id_token`');
  }
  // console.log(util.inspect(req.query));
  auth.verify(id_token)
    .then((credential) => {
      // console.log(util.inspect(credential));
      bigquery.data()
        .then((rows) => {
          var response = _formatAsDataTable(rows);
          res.setHeader('Content-Type', 'application/json');
          res.send(JSON.stringify(response));
        });
    })
    .catch(next);
});

app.get('/chart', (req, res) => {
  res.sendFile('./chart.html', {root: __dirname});
});

app.get('/', (req, res) => {
  res.send('Hello, World!');
});

/* ERROR HANDLING */
/// https://expressjs.com/en/guide/error-handling.html
function logErrors (err, req, res, next) {
  console.error(err)
  log.write(err.message)
  next(err)
}
function clientErrorHandler (err, req, res, next) {
  if (req.xhr) {
    res.status(500).send({ error: err.message })
  } else {
    next(err)
  }
}
function errorHandler (err, req, res, next) {
  res.status(500)
  res.send(err.message)
}
app.use(logErrors);
app.use(clientErrorHandler);
app.use(errorHandler);


// Listen to the App Engine-specified port, or 8080 otherwise
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}...`);
});

