const functions = require('firebase-functions')
//var serviceAccount = require("/Users/vincent/Documents/_TOOLS/shitty-radar-firebase-adminsdk-xd6xr-2480992b5e.json");

const admin = require('firebase-admin')
admin.initializeApp({
    //credential: admin.credential.cert(serviceAccount),
    storageBucket: 'shitty-radar.appspot.com',
})
admin.firestore().settings({ timestampsInSnapshots: true })
const cors = require('cors')({ origin: true })

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions

exports.getLocation = functions.https.onRequest((req, res) => {
    cors(req, res, () => {
        const db = admin.firestore()

        return db
            .doc(`/radars/MbtRBMksjOpdICaqr3Z4`)
            .get()
            .then(async doc => {
                res.status(200).json(doc.data())
            })
    })
})

exports.getImage = functions.https.onRequest((req, res) => {
    cors(req, res, () => {
        var bucket = admin.storage().bucket()

        bucket.getFiles().then(files => {
            let urls = []
            const images = files[0]
            images.forEach(function(entry) {
                urls.push(
                    'https://firebasestorage.googleapis.com/v0/b/shitty-radar.appspot.com/o/' +
                        entry.id +
                        '?alt=media'
                )
            })
            var rand = urls[Math.floor(Math.random() * urls.length)]
            res.status(200).json(rand)
        })
    })
})
