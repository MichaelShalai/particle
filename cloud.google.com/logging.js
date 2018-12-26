// Imports the Google Cloud client library.
const gcloudLogging = require('@google-cloud/logging');
const colors = require('colors')
const {gcloudConfig} = require('./config.js');

const logId = 'smart-home';

class Logging {
  constructor() {
    process.stdout.write(colors.magenta('Initializing Stackdriver Logging with Google Cloud... '))

    // Creates a client.
    this._api = new gcloudLogging.Logging(gcloudConfig)

    // Selects the log to write to.
    this._log = this._api.log(logId)

    console.log(colors.magenta('done!'))
  }

  async write(message) {
    // The metadata associated with the entry.
    const metadata = {
      // resource: {type: 'global'},
    }

    // Prepares a log entry.
    const entry = this._log.entry(metadata, message)

    // Writes the log entry
    await this._log.write(entry)
  }
}

module.exports = {
  Logging
};