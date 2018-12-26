const firebaseAdmin = require('firebase-admin');
const firebaseServiceAccount = require('./keys/key-firebase.json');

module.exports = {
  gcloudConfig: {
    projectId: 'smart-home-226503',
    serviceAccountKeyFilePath: './keys/key.json',
    pubsubSubscriptionName: 'particle',
    bigqueryDatasetId: 'particle',
    bigqueryTableId: 'reading',
  },
  // https://firebase.google.com/docs/reference/admin/node/admin.app.AppOptions
  firebaseConfig: {
    apiKey: "AIzaSyCpdduwL4dHKmafhFOvPTtikVy24VniFYE",
    authDomain: "smart-home-226503.firebaseapp.com",
    credential: firebaseAdmin.credential.cert(firebaseServiceAccount),
  }
}
