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

nunjucks.configure('views', {
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

// Dev credentials
let serviceAccount = require(path.join(__dirname, 'firebase/todo-app-5160d-firebase-adminsdk-jsx5p-5c1e8b43b1.json'));

// Production credentials
// let serviceAccountFile = process.env.GOOGLE_APPLICATION_CREDENTIALS;
// let serviceAccount = JSON.parse(serviceAccountFile);

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://todo-app-5160d.firebaseio.com',
    databaseAuthVariableOverride: {
        uid: 'my-service-worker'
    }
});

const db = admin.firestore();

app.get('/', (req, res) => {
    // console.log('------- credentials------');
    // console.log(serviceAccount);
    // console.log('------- end of credentials------');
    // console.log('------- credentials json ------');
    // let jsonServiceAccount = JSON.parse(serviceAccount);
    // console.log(jsonServiceAccount);
    // console.log('------- end of credentials json------');
    // console.log(`type of credentials = ${typeof serviceAccount}`);
    // console.log(`type of credentials = ${typeof jsonServiceAccount}`);
    // console.log(process.env.GOOGLE_APPLICATION_CREDENTIALS);
    // res.render('login.html');

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
        res.render('login.html');
    });
});

app.get('/sessionLogout', (req, res) => {
    res.clearCookie('session');
    res.redirect('/login');
});

app.post('/authenticate', (req, res) => {
    // Get the ID token passed and the CSRF token.
    const idToken = req.body.idToken.toString();
    user = req.body.user;
    console.log(user);

    // idToken comes from the client app
    session.verifyIdToken(admin, idToken);

    // Set session expiration to 5 days.
    const expiresIn = 60 * 60 * 24 * 5 * 1000;
    // Create the session cookie. This will also verify the ID token in the process.
    // The session cookie will have the same claims as the ID token.
    // To only allow session cookie setting on recent sign-in, auth_time in ID token
    // can be checked to ensure user was recently signed in before creating a session cookie.
    session.createSessionCookie(admin, idToken, user, expiresIn, res);
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
    const date = req.body.date;
    if (uid) {
        const todoListRef = db.collection('users').doc(uid);
        const doc = await todoListRef.get();
        if (!doc.exists) {
            res.send('No such document!');
        } else {
            await todoListRef.update({
                tasks: admin.firestore.FieldValue.arrayUnion({
                    name: task,
                    date: admin.firestore.Timestamp.fromDate(new Date(date))
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

app.listen(port, () => {
    console.log(`Listening at port ${port}`);
});