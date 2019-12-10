const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);
admin.firestore().settings({timestampsInSnapshots: true});
const cors = require('cors')({origin: true});


// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
exports.getLocation =  functions.https.onRequest((req, res) => {
    cors(req, res, () => {
        const db = admin.firestore();

        return db.doc(`/radars/MbtRBMksjOpdICaqr3Z4`)
        .get()
        .then(async doc => {
            res.status(200).json(doc.data());
        });
    });
});