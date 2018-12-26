const colors = require('colors')
const admin = require('firebase-admin');
const serviceAccount = require('./keys/key-firebase.json');

const appConfig = {
  apiKey: "AIzaSyCpdduwL4dHKmafhFOvPTtikVy24VniFYE",
  authDomain: "smart-home-226503.firebaseapp.com",
  credential: admin.credential.cert(serviceAccount),
};

class Auth {
  constructor() {
    console.log(colors.magenta('Initializing Firebase...'));
    // https://firebase.google.com/docs/reference/node/firebase#.initializeApp
    this._app = admin.initializeApp(appConfig);
    console.log(colors.magenta(`Firebase initialized. Application name: ${this._app.name}`));
  }

  verify(id_token) {
    // TODO: migrate to firebase-admin, see https://firebase.google.com/docs/admin/setup

    // https://firebase.google.com/docs/reference/node/firebase.auth.Auth#verifyIdToken
    return this._app.auth().verifyIdToken(id_token);

    // .catch(function(error) {
    //   // Handle Errors here.
    //   var errorCode = error.code;
    //   var errorMessage = error.message;
    //   // The email of the user's account used.
    //   var email = error.email;
    //   // The firebase.auth.AuthCredential type that was used.
    //   var credential = error.credential;
    //   // ...
    // });
  }
}

module.exports = {
  Auth
};
