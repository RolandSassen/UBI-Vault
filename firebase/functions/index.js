const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
//const cors = require('cors');
const app = express();

admin.initializeApp();

// Automatically allow cross-origin requests
//app.use(cors({ origin: true }));

app.get('/hello', (req, res) => {
  res.end("Received GET request!");
});

app.post('/checkPhonenumberVerification', (req, res) => {
  if(req.body.key == functions.config().api.key)
  {
    console.log("checkPhonenumberVerification");
    console.log(req.body.phoneNumber);

    admin.auth().getUserByPhoneNumber(req.body.phoneNumber)
    .then(function(userRecord) {
    // See the UserRecord reference doc for the contents of userRecord.
      console.log('Successfully fetched user data:', userRecord.toJSON());
      res.end("verified");
    })
    .catch(function(error) {
      console.log('Error fetching user data:', error);
//      res.end("not authorized");
        res.end("not verified");
    });

  }
  else {
    res.end("not authorized");
//403 error
  }

});

// Expose Express API as a single Cloud Function:
exports.ubivault = functions.https.onRequest(app);

// Create and Deploy Your First Cloud Functions
// https://firebase.google.com/docs/functions/write-firebase-functions
