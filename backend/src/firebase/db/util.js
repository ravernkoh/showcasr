const firebase = require("firebase-admin");

// Converts all the Firebase `Timestamp` objects to native `Date` objects.
//
// Only does a shallow operation. Mutates the given object and also returns it.
convertTimestampsToDates = object => {
  for (const key in object) {
    if (object[key] instanceof firebase.firestore.Timestamp) {
      object[key] = object[key].toDate();
    }
  }
  return object;
};

module.exports = {
  convertTimestampsToDates
};
