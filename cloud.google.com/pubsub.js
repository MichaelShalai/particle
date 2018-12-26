const {PubSub} = require('@google-cloud/pubsub')
const colors = require('colors')
const {gcloudConfig} = require('./config.js');

// PUBSUB
process.stdout.write(colors.magenta('Initializing PubSub with Google Cloud... '))
const pubsub = new PubSub({
  projectId: gcloudConfig.projectId,
  keyFilename: gcloudConfig.serviceAccountKeyFilePath,
})
console.log(colors.magenta('done!'))

module.exports = pubsub;