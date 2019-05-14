const firebase = require('firebase-admin');

const db = require('./db');

const serviceAccount = require('../../serviceAccountKey.json');

module.exports = () => {
  firebase.initializeApp({
    credential: firebase.credential.cert(serviceAccount),
    databaseURL: 'https://ravernkoh-showcasr.firebaseio.com',
  });
  return {
    db: db(firebase),
  };
};
