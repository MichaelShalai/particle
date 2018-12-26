const colors = require('colors')
const admin = require('firebase-admin');
const {firebaseConfig} = require('./config.js');

class Auth {
  constructor() {
    process.stdout.write(colors.magenta('Initializing Firebase... ' ));
    // https://firebase.google.com/docs/reference/node/firebase#.initializeApp
    this._app = admin.initializeApp(firebaseConfig);
    console.log(colors.magenta(`done! Application name: ${this._app.name}`));
  }

  verify(id_token) {
    // https://firebase.google.com/docs/reference/node/firebase.auth.Auth#verifyIdToken
    return this._app.auth().verifyIdToken(id_token);
  }
}

module.exports = {
  Auth
};
