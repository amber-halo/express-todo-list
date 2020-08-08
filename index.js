const express = require('express');
const helmet = require('helmet');
const path = require('path');
require('dotenv').config();
const cors = require('cors');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const nunjucks = require('nunjucks');

const session = require(path.join(__dirname, 'src/session'));
const utils = require(path.join(__dirname, 'src/utils'));

const app = express();
const port = process.env.PORT || 5000;

nunjucks.configure('public/templates', {
    autoescape: true,
    express: app
});

var admin = require('firebase-admin');
var user;

app.use(helmet());
app.use(cors());
app.use(morgan('common'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static('public'));

let serviceAccount = require(path.join(__dirname, 'firebase/todo-app-5160d-firebase-adminsdk-jsx5p-08da4eb532.json'));
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://todo-app-5160d.firebaseio.com',
    databaseAuthVariableOverride: {
        uid: 'my-service-worker'
    }
});

const db = admin.firestore();

app.get('/', (req, res) => {
    utils.getSessionCookie(admin, req, () => {
        // On success
        res.redirect('/home');
    }, () => {
        // On error
        res.redirect('/login');
    });
});

app.get('/home', (req, res) => {
    utils.getSessionCookie(admin, req, () => {
        // On success
        const uid = req.cookies.uid || '';

        admin.auth().getUser(uid)
        .then(function(userRecord) {
            // See the UserRecord reference doc for the contents of userRecord.
            // console.log('Successfully fetched user data:', userRecord.toJSON());
            console.log('Success')
            res.render('index.html', { userRecord: userRecord });
        })
        .catch(function(error) {
            console.log('Error fetching user data:', error);
            res.send('error');
        });
        
    }, () => {
        // On error
        res.redirect('/login');
    });
});

app.get('/login', (req, res) => {
    utils.getSessionCookie(admin, req, () => {
        // On success
        res.redirect('/home');
    }, () => {
        // On error
        res.sendFile(path.join(__dirname, 'public/templates/login.html'));
    });
});

app.post('/authenticate', (req, res) => {
    // Get the ID token passed and the CSRF token.
    const idToken = req.body.idToken.toString();
    user = req.body.user;
    console.log(user);

    // idToken comes from the client app
    session.verifyIdToken(admin, idToken);
    // admin.auth().verifyIdToken(idToken)
    // .then((decodedToken) => {
    //     let uid = decodedToken.uid;
    //     console.log(uid);
    // }).catch((error) => {
    //     // Handle error
    //     console.log(error);
    // });

    // const csrfToken = req.body.csrfToken.toString();
    // // Guard against CSRF attacks.
    // if (csrfToken !== req.cookies.csrfToken) {
    //     res.status(401).send('UNAUTHORIZED REQUEST!');
    //     return;
    // }

    // Set session expiration to 5 days.
    const expiresIn = 60 * 60 * 24 * 5 * 1000;
    // Create the session cookie. This will also verify the ID token in the process.
    // The session cookie will have the same claims as the ID token.
    // To only allow session cookie setting on recent sign-in, auth_time in ID token
    // can be checked to ensure user was recently signed in before creating a session cookie.
    session.createSessionCookie(admin, idToken, user, expiresIn, res);

    // admin.auth().createSessionCookie(idToken, { expiresIn })
    // .then((sessionCookie) => {
    //     // Set cookie policy for session cookie.
    //     const options = { maxAge: expiresIn, httpOnly: true, secure: true };
    //     res.cookie('session', sessionCookie, options);
    //     // res.redirect('/home');
    //     res.end(JSON.stringify({ status: 'success' }));
    // }, error => {
    //     console.log(error);
    //     // res.status(401).send('UNAUTHORIZED REQUEST!');
    //     res.send('ERROR');
    // });
});

app.get('/getTodoList', async (req, res) => {
    const uid = req.cookies.uid;
    if (uid) {
        const todoListRef = db.collection('users').doc(uid);
        const doc = await todoListRef.get();
        if (!doc.exists) {
            console.log('No such document!');
            // const docRef = db.collection('users').doc('aturing');
            await todoListRef.set({
                tasks: []
            });
            res.send('documento creado');
        } else {
            console.log('Document data:', doc.data());
            res.send(doc.data());
        }
    }
});

app.post('/addTask', async (req, res) => {
    const uid = req.cookies.uid;
    const task = req.body.task;
    if (uid) {
        const todoListRef = db.collection('users').doc(uid);
        const doc = await todoListRef.get();
        if (!doc.exists) {
            res.send('No such document!');
        } else {
            await todoListRef.update({
                // tasks: admin.firestore.FieldValue.arrayUnion(task)
                tasks: admin.firestore.FieldValue.arrayUnion({
                    name: task,
                    date: admin.firestore.Timestamp.fromDate(new Date())
                })
            });
            res.redirect('/getTodoList');
        }
    }
});

// async function addData() {
//     const docRef = db.collection('users').doc('aturing');
//     await docRef.set({
//         first: 'Alan',
//         last: 'Turing',
//         born: 1940
//     });
// }

// async function getData() {
//     const snapshot = await db.collection('users').get();
//     snapshot.forEach((doc) => {
//         console.log(doc.id, '=>', doc.data());
//     });
// }

// app.get('/addData', (req, res) => {
//     addData();
//     res.send('exito');
// });

// app.get('/getData', (req, res) => {
//     getData();
//     res.send('mas exito');
// });

app.listen(port, () => {
    console.log(`Listening at port ${port}`);
});