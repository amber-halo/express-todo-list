module.exports.verifyIdToken = function verifyIdToken(admin, idToken) {
    admin.auth().verifyIdToken(idToken)
    .then((decodedToken) => {
        let uid = decodedToken.uid;
        console.log(`uid: ${uid}`);
    }).catch((error) => {
        // Handle error
        console.log(error);
    });
};

module.exports.createSessionCookie = function createSessionCookie(admin, idToken, user, expiresIn, res) {
    // admin.auth().createSessionCookie(idToken, { expiresIn })
    // .then((sessionCookie) => {
    //     // Set cookie policy for session cookie.
    //     const options = { maxAge: expiresIn, httpOnly: true, secure: true };
    //     res.cookie('session', sessionCookie, options);
    //     console.log('coookie creada con exito');
    //     // res.send('success');
    //     // res.redirect('/home');
    //     // res.end(JSON.stringify({ status: 'success' }));
    // }).catch((error) => {
    //     console.log(error);
    //     // res.status(401).send('UNAUTHORIZED REQUEST!');
    //     res.send('ERROR');
    // });

    admin.auth().createSessionCookie(idToken, { expiresIn })
    .then((sessionCookie) => {
        const options = { maxAge: expiresIn, httpOnly: true }; // not secure (only HTTP)
        res.cookie('session', sessionCookie, options);
        res.cookie('uid', user, options);
        res.end(JSON.stringify({ status: 'success' }));
    }).catch((error) => {
        console.log('ERROR AQUI');
        console.log(error);
    });
};