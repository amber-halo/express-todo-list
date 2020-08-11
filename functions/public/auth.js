function setUserSession(idToken, user) {
    // Send ID token to backend
    $.ajax({
        method: 'POST',
        url: '/authenticate',
        type: 'POST',
        data: { idToken: idToken, user: user },
        success: function (response) {
            console.log(response);
            window.location = '/home';
        },
        error: function (error) {
            console.log(error);
        }
    });
}

function handleError(error) {
    // Send error to backend
}

function isUserEqual(googleUser, firebaseUser) {
    if (firebaseUser) {
        var providerData = firebaseUser.providerData;
        for (var i = 0; i < providerData.length; i++) {
            if (providerData[i].providerId === firebase.auth.GoogleAuthProvider.PROVIDER_ID
                && providerData[i].uid === googleUser.getBasicProfile().getId()) {
                // We don't need to reauth the Firebase connection.
                return true;
            }
        }
    }
    return false;
}

function onSignIn(googleUser) {
    console.log('Google Auth Response', googleUser);
    firebase.auth().setPersistence(firebase.auth.Auth.Persistence.NONE);

    // We need to register an Observer on Firebase Auth to make sure auth is initialized.
    var unsubscribe = firebase.auth().onAuthStateChanged(function (firebaseUser) {
        unsubscribe();

        // Check if we are already signed-in Firebase with the correct user.
        if (!isUserEqual(googleUser, firebaseUser)) {
            // Build Firebase credential with the Google ID token.
            let credential = firebase.auth.GoogleAuthProvider.credential(
                googleUser.getAuthResponse().id_token
            );

            // Sign in with credential from the Google user.
            firebase.auth().signInWithCredential(credential).then(function (result) {
                // console.log(result);
                // var idToken = googleUser.getAuthResponse().id_token;
                // var idToken = result.credential;
            }).catch(function (error) {
                // Handle Errors here.
                let errorCode = error.code;
                let errorMessage = error.message;
                console.log(errorMessage + ' ' + errorCode);
                // The email of the user's account used.
                let email = error.email;
                // The firebase.auth.AuthCredential type that was used.
                let credentialError = error.credential;
                // ...
            });
        } else {
            console.log('User already signed-in Firebase.');

            // eslint-disable-next-line camelcase
            var id_token = googleUser.getAuthResponse().id_token;

            // // Build Firebase credential with the Google ID token.
            var credential = firebase.auth.GoogleAuthProvider.credential(id_token);

            // // Sign in with credential from the Google user.
            firebase.auth().signInWithCredential(credential).then(function (result) {
                firebase.auth().currentUser.getIdToken(true).then(function (idToken) {
                    // Send token to your backend via HTTPS
                    console.log(idToken);
                    console.log(firebaseUser);

                    // const user = {
                    //     displayName: firebaseUser.displayName,
                    //     email: firebaseUser.email,
                    //     emailVerified: firebaseUser.emailVerified,
                    //     photoURL: firebaseUser.photoURL,
                    //     uid: firebaseUser.uid,
                    // }
                    // console.log(user);
                    setUserSession(idToken, firebaseUser.uid);
                }).catch(function (error) {
                    // Handle error
                    console.log(error);
                });
            }).catch(function (error) {
                console.log('error');
                // Handle Errors here.
                var errorCode = error.code;
                var errorMessage = error.message;
                // The email of the user's account used.
                var email = error.email;
                // The firebase.auth.AuthCredential type that was used.
                var credentialError = error.credential;
                // ...
                console.log(errorMessage);
            });
        }
    });
}