const {PubSub} = require('@google-cloud/pubsub')
const colors = require('colors')
const gcloudConfig = require('./config.js');

// PUBSUB
console.log(colors.magenta('Authenticating PubSub with Google Cloud...'))
const pubsub = new PubSub({
  projectId: gcloudConfig.projectId,
  keyFilename: gcloudConfig.serviceAccountKeyFilePath,
})
console.log(colors.magenta('Authentication successful!'))

module.exports = pubsub;